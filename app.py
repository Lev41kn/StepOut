# -*- coding: utf-8 -*-
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv

# Імпортуємо наш лімітер з нейтральної території
from extensions import limiter

# Імпортуємо Блюпрінти (маршрути)
from routes.auth import auth_bp
from routes.notes import notes_bp
from routes.tasks import tasks_bp
from routes.mood import mood_bp

# Завантажуємо змінні з .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Налаштування JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# Налаштування ліміту завантаження файлів (2 МБ)
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024

# Ініціалізуємо лімітер для нашого додатку
limiter.init_app(app)

# --- РЕЄСТРАЦІЯ МАРШРУТІВ ---
# Авторизація (Login, Register, Password Reset)
app.register_blueprint(auth_bp, url_prefix='/api')

# Нотатки (Notes)
app.register_blueprint(notes_bp, url_prefix='/api/notes')

# Завдання та Стріки (Tasks)
app.register_blueprint(tasks_bp, url_prefix='/api')

# Трекер настрою та Графіки (Mood)
app.register_blueprint(mood_bp, url_prefix='/api/mood')


@app.route('/')
def index():
    return "StepOut Backend API is Running!"

if __name__ == '__main__':
    # Запуск сервера
    # debug=True дозволяє серверу перезавантажуватися при зміні коду
    app.run(host='0.0.0.0', port=5000, debug=True)
