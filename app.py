# -*- coding: utf-8 -*-
import bleach
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash # Додали для кібербезпеки
from datetime import date, timedelta
import os
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Ця команда відкриває наш "сейф"
load_dotenv()

app = Flask(__name__)
CORS(app)

# НАЛАШТУВАННЯ ЗАХИСТУ ВІД БРУТФОРСУ (Rate Limiting)
# get_remote_address означає, що ми запам'ятовуємо IP-адресу хакера
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"], # Базовий ліміт для всього сайту взагалі
    storage_uri="memory://" # Тимчасово зберігаємо лонги в оперативній пам'яті
)

# Налаштування JWT (читаємо секретний ключ з нашого сейфу)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )   

# 1. РЕЄСТРАЦІЯ (З безпечним хешуванням пароля)
@app.route('/api/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Перетворюємо пароль на "абракадабру" (напр. pbkdf2:sha256:250000$...)
    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Зберігаємо у базу саме ХЕШ, а не реальний пароль
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
        conn.commit()
        return jsonify({"status": "success", "message": "Реєстрація успішна!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": "Такий логін вже існує!"}), 409
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# 2. ВХІД / ЛОГІН (Перевірка даних)
@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password') # Пароль, який юзер ввів при вході

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # dictionary=True видає результат у зручному форматі
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

       # Якщо юзер є в базі І його введений пароль збігається з нашим хешем
        if user and check_password_hash(user['PASSWORD'], password):
            # СТВОРЮЄМО ТОКЕН (Зашиваємо туди ID користувача)
            access_token = create_access_token(identity=user['id'])
            
            return jsonify({
                "status": "success", 
                "message": "Вхід успішний!",
                "token": access_token,  # Віддаємо токен фронтенду!
                "user_id": user['id'],
                "streak": user['streak']
            }), 200
        else:
            return jsonify({"status": "error", "message": "Неправильний логін або пароль!"}), 401
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# 3. ДОДАВАННЯ НОТАТОК
@app.route('/api/notes', methods=['POST'])
@jwt_required()
def add_note():
    data = request.json
    current_user_id = get_jwt_identity() 
    
    # БЕРЕМО ДАНІ
    raw_title = data.get('title')
    raw_content = data.get('content') 

    # ОЧИЩАЄМО ДАНІ ВІД ХАКЕРСЬКИХ СКРИПТІВ (XSS Захист)
    # bleach.clean() виріже всі теги <script>, <iframe> і залишить тільки чистий текст
    safe_title = bleach.clean(raw_title) if raw_title else ""
    safe_content = bleach.clean(raw_content) if raw_content else ""

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # ЗБЕРІГАЄМО ТІЛЬКИ ОЧИЩЕНІ ДАНІ (safe_title, safe_content)
        cursor.execute("INSERT INTO notes (user_id, title, content) VALUES (%s, %s, %s)", (current_user_id, safe_title, safe_content))
        conn.commit()
        return jsonify({"status": "success", "message": "Нотатку збережено!"}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# 4. ОТРИМАННЯ НОТАТОК (Прибираємо <int:user_id> з посилання)
@app.route('/api/notes', methods=['GET'])
@jwt_required()  
def get_notes():
    # Сервер сам знає, чиї нотатки віддавати, завдяки токену
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        cursor.execute(
            "SELECT id, title, content, created_at FROM notes WHERE user_id = %s ORDER BY created_at DESC", 
            (current_user_id,)
        )
        notes = cursor.fetchall()
        
        return jsonify({
            "status": "success", 
            "notes": notes
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": "Помилка бази даних"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# 5. ЩОДЕННИЙ ЧЕК-ІН
@app.route('/api/daily_check', methods=['POST'])
@jwt_required()
def daily_check():
    # Знову ж таки, беремо ID з токена
    current_user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT streak, last_active_date FROM users WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"status": "error", "message": "Користувача не знайдено"}), 404
            
        today = date.today()
        last_active = user['last_active_date']
        current_streak = user['streak']
        
        # ... (тут твоя логіка стріків залишається абсолютно без змін) ...
        if last_active == today:
            message = "Ти вже заходив сьогодні. Стрік зберігається!"
        elif last_active == today - timedelta(days=1):
            current_streak += 1
            cursor.execute("UPDATE users SET streak = %s, last_active_date = %s WHERE id = %s", (current_streak, today, current_user_id))
            conn.commit()
            message = "Стрік росте! Ти супер!"
        else:
            current_streak = 1
            cursor.execute("UPDATE users SET streak = %s, last_active_date = %s WHERE id = %s", (current_streak, today, current_user_id))
            conn.commit()
            message = "Стрік скинуто. Починаємо новий шлях!"
            
        return jsonify({"status": "success", "message": message, "streak": current_streak}), 200
        
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
if __name__ == '__main__':
    # host='0.0.0.0' щоб колеги зі Львова бачили твій сервер
    # ssl_context='adhoc' автоматично генерує тимчасовий SSL сертифікат для локальної розробки
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context='adhoc')