# -*- coding: utf-8 -*-
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash # Додали для кібербезпеки
from datetime import date, timedelta
import os
from dotenv import load_dotenv

# Ця команда відкриває наш "сейф"
load_dotenv()

app = Flask(__name__)
CORS(app)

# Налаштування JWT (читаємо секретний ключ з нашого сейфу)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )   

# 1. РЕЄСТРАЦІЯ (З безпечним хешуванням пароля)
@app.route('/api/register', methods=['POST'])
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

# 3. ДОДАВАННЯ НОТАТОК (Будь-якого розміру)
@app.route('/api/notes', methods=['POST'])
@jwt_required()
def add_note():
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    content = data.get('content') # Сюди колега зможе слати величезні тексти

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO notes (user_id, title, content) VALUES (%s, %s, %s)", (user_id, title, content))
        conn.commit()
        return jsonify({"status": "success", "message": "Нотатку збережено!"}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# 4. ОТРИМАННЯ НОТАТОК (Читання - ТІЛЬКИ ДЛЯ АВТОРИЗОВАНИХ)
@app.route('/api/notes/<int:user_id>', methods=['GET'])
@jwt_required()  # <--- ОСЬ ЦЕЙ ОХОРОНЕЦЬ
def get_notes(user_id):
    # Далі йде твій старий код...
    try:
        conn = get_db_connection()
        # dictionary=True автоматично перетворює рядки з бази у зручний JSON-формат
        cursor = conn.cursor(dictionary=True) 
        
        # Шукаємо всі нотатки цього юзера і сортуємо від найновіших до найстаріших
        cursor.execute(
            "SELECT id, title, content, created_at FROM notes WHERE user_id = %s ORDER BY created_at DESC", 
            (user_id,)
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

    # 5. ЩОДЕННИЙ ЧЕК-ІН (Для оновлення стріку)
@app.route('/api/daily_check', methods=['POST'])
@jwt_required()
def daily_check():
    data = request.json
    user_id = data.get('user_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Дістаємо поточний стрік і дату останнього візиту
        cursor.execute("SELECT streak, last_active_date FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"status": "error", "message": "Користувача не знайдено"}), 404
            
        today = date.today()
        last_active = user['last_active_date']
        current_streak = user['streak']
        
        # ЛОГІКА СТРІКІВ:
        if last_active == today:
            # Юзер вже відкривав додаток сьогодні. Стрік не міняємо.
            message = "Ти вже заходив сьогодні. Стрік зберігається!"
            
        elif last_active == today - timedelta(days=1):
            # Юзер був вчора. Молодець, даємо +1!
            current_streak += 1
            cursor.execute("UPDATE users SET streak = %s, last_active_date = %s WHERE id = %s", (current_streak, today, user_id))
            conn.commit()
            message = "Стрік росте! Ти супер!"
            
        else:
            # Юзер пропустив більше одного дня (або це його найперший вхід). Скидаємо до 1.
            current_streak = 1
            cursor.execute("UPDATE users SET streak = %s, last_active_date = %s WHERE id = %s", (current_streak, today, user_id))
            conn.commit()
            message = "Стрік скинуто. Починаємо новий шлях!"
            
        return jsonify({
            "status": "success", 
            "message": message,
            "streak": current_streak
        }), 200
        
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    # host='0.0.0.0' щоб колеги зі Львова бачили твій сервер
    app.run(host='0.0.0.0', port=5000, debug=True)