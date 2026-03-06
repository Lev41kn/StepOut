
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Підключення до твого MAMP
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='stepout_db'
    )

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Спроба вставити нового юзера
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
        conn.commit()
        return jsonify({"status": "success", "message": "Реєстрація успішна!"}), 201
    except mysql.connector.Error as err:
        # Якщо логін вже є, спрацює ця помилка (через UNIQUE в SQL)
        return jsonify({"status": "error", "message": "Такий логін вже існує!"}), 409
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    # host='0.0.0.0' щоб колеги зі Львова бачили твій сервер
    app.run(host='0.0.0.0', port=5000, debug=True)