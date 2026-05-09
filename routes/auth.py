# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import mysql.connector
from database import get_db_connection
from extensions import limiter
import random
from datetime import datetime, timedelta
import os
import smtplib
from email.message import EmailMessage


auth_bp = Blueprint('auth', __name__)

# --- ДОПОМІЖНА ФУНКЦІЯ: ВІДПРАВКА ЛИСТА ---
def send_email(to_email, code):
    sender_email = os.getenv('MAIL_USERNAME')
    sender_password = os.getenv('MAIL_PASSWORD')
    
    if not sender_email or not sender_password:
        print(f"УВАГА: Пошта не налаштована. Ваш код для {to_email}: {code}")
        return # Якщо паролів немає, просто виводимо код у консоль (зручно для тестів)

    msg = EmailMessage()
    msg.set_content(f"Твій код для відновлення пароля у StepOut: {code}\nКод діє 15 хвилин.")
    msg['Subject'] = 'Відновлення пароля StepOut'
    msg['From'] = sender_email
    msg['To'] = to_email

    try:
        # Підключаємося до сервера Gmail
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Помилка відправки листа: {e}")


# --- 1. РЕЄСТРАЦІЯ (Тепер з Email та Name) ---
@auth_bp.route('/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not email or not password or not name:
        return jsonify({"status": "error", "message": "Заповніть всі поля!"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # username залишаємо пустим або дублюємо туди email (залежить від структури твоєї бази)
        cursor.execute("INSERT INTO users (email, name, password, username) VALUES (%s, %s, %s, %s)", 
                       (email, name, hashed_password, email))
        conn.commit()
        return jsonify({"status": "success", "message": "Реєстрація успішна!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": "Ця пошта вже зареєстрована!"}), 409
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 2. ЛОГІН (Тепер через Email) ---
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Шукаємо юзера по email, а не по username
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            access_token = create_access_token(identity=user['id'])
            return jsonify({
                "status": "success", 
                "message": "Вхід успішний!",
                "token": access_token,
                "user_id": user['id'],
                "name": user['name'],
                "streak": user['streak']
            }), 200
        else:
            return jsonify({"status": "error", "message": "Неправильна пошта або пароль!"}), 401
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 3. ЗАБУВ ПАРОЛЬ (Генерація коду) ---
@auth_bp.route('/password/forgot', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    data = request.json
    email = data.get('email')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            # Навіть якщо пошти немає, кажемо "успіх", щоб хакери не могли перевіряти, які пошти є в базі
            return jsonify({"status": "success", "message": "Якщо така пошта існує, ми відправили на неї код."}), 200

        # Генеруємо 4 цифри
        code = str(random.randint(1000, 9999))
        expires_at = datetime.now() + timedelta(minutes=15) # Код діє 15 хвилин

        cursor.execute("INSERT INTO password_resets (email, code, expires_at) VALUES (%s, %s, %s)", 
                       (email, code, expires_at))
        conn.commit()

        # Відправляємо лист
        send_email(email, code)

        return jsonify({"status": "success", "message": "Код відправлено на пошту!"}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 4. ПЕРЕВІРКА КОДУ ---
@auth_bp.route('/password/verify-code', methods=['POST'])
def verify_code():
    data = request.json
    email = data.get('email')
    code = data.get('code')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Шукаємо останній актуальний код для цієї пошти
        cursor.execute("SELECT * FROM password_resets WHERE email = %s AND code = %s ORDER BY id DESC LIMIT 1", 
                       (email, code))
        record = cursor.fetchone()

        if not record:
            return jsonify({"status": "error", "message": "Неправильний код!"}), 400
        
        if record['expires_at'] < datetime.now():
            return jsonify({"status": "error", "message": "Час дії коду минув!"}), 400

        # Якщо код правильний, видаємо спеціальний короткий токен на 15 хвилин для зміни пароля
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        # Видаляємо використаний код з бази
        cursor.execute("DELETE FROM password_resets WHERE id = %s", (record['id'],))
        conn.commit()

        temp_token = create_access_token(identity=user['id'], expires_delta=timedelta(minutes=15))

        return jsonify({"status": "success", "reset_token": temp_token}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 5. ЗБЕРЕЖЕННЯ НОВОГО ПАРОЛЯ ---
@auth_bp.route('/password/reset', methods=['POST'])
@jwt_required() # Вимагаємо той самий reset_token, який ми видали на попередньому кроці
def reset_password():
    data = request.json
    new_password = data.get('new_password')
    user_id = get_jwt_identity()

    hashed_password = generate_password_hash(new_password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        conn.commit()
        return jsonify({"status": "success", "message": "Пароль успішно змінено!"}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()