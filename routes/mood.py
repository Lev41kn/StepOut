# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
import mysql.connector
from database import get_db_connection

mood_bp = Blueprint('mood', __name__)

# 1. ЗБЕРЕЖЕННЯ АБО ОНОВЛЕННЯ НАСТРОЮ
@mood_bp.route('/', methods=['POST'])
@jwt_required()
def add_mood():
    data = request.json
    current_user_id = get_jwt_identity()
    mood_value = data.get('mood_value') # Очікуємо число від фронтенду

    if mood_value is None:
        return jsonify({"status": "error", "message": "Не вказано значення настрою"}), 400

    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Перевіряємо, чи юзер вже ставив настрій сьогодні
        cursor.execute("SELECT id FROM mood_logs WHERE user_id = %s AND created_at = %s", (current_user_id, today))
        existing_mood = cursor.fetchone()

        if existing_mood:
            # Якщо вже ставив - просто оновлюємо значення
            cursor.execute("UPDATE mood_logs SET mood_value = %s WHERE id = %s", (mood_value, existing_mood[0]))
            message = "Настрій оновлено!"
        else:
            # Якщо це перша оцінка за день - створюємо новий запис
            cursor.execute("INSERT INTO mood_logs (user_id, mood_value, created_at) VALUES (%s, %s, %s)", (current_user_id, mood_value, today))
            message = "Настрій збережено!"
            
        conn.commit()
        return jsonify({"status": "success", "message": message}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# 2. ОТРИМАННЯ ІСТОРІЇ НАСТРОЮ (Для графіків статистики)
@mood_bp.route('/', methods=['GET'])
@jwt_required()
def get_mood_history():
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Беремо настрій за останні 30 днів і сортуємо по даті (щоб графік малювався зліва направо)
        cursor.execute(
            "SELECT mood_value, created_at FROM mood_logs WHERE user_id = %s ORDER BY created_at ASC LIMIT 30",
            (current_user_id,)
        )
        mood_history = cursor.fetchall()
        
        # Перетворюємо дати у зручний текстовий формат для фронтенду
        for entry in mood_history:
            entry['created_at'] = entry['created_at'].strftime('%Y-%m-%d')

        return jsonify({
            "status": "success", 
            "history": mood_history
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": "Помилка бази даних"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- 3. ДАНІ ДЛЯ ГРАФІКА (Дні / Тижні / Місяці) ---
@mood_bp.route('/chart', methods=['GET'])
@jwt_required()
def get_mood_chart():
    current_user_id = get_jwt_identity()
    
    # Читаємо, яку саме вкладку вибрав юзер на фронтенді (по замовчуванню - дні)
    period = request.args.get('period', 'days') 

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if period == 'days':
            # Вкладка "Дні": Беремо останні 30 днів
            # DATE_FORMAT робить гарний підпис, наприклад "13.03"
            cursor.execute("""
                SELECT DATE_FORMAT(created_at, '%d.%m') as label, mood_value as value 
                FROM mood_logs 
                WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ORDER BY created_at ASC
            """, (current_user_id,))
            
        elif period == 'weeks':
            # Вкладка "Тижні": Рахуємо середній настрій за кожен тиждень (останні 12 тижнів)
            cursor.execute("""
                SELECT CONCAT('Тиж. ', WEEK(created_at)) as label, AVG(mood_value) as value 
                FROM mood_logs 
                WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
                GROUP BY WEEK(created_at)
                ORDER BY WEEK(created_at) ASC
            """, (current_user_id,))
            
        elif period == 'months':
            # Вкладка "Місяці": Рахуємо середній настрій за кожен місяць (за рік)
            cursor.execute("""
                SELECT DATE_FORMAT(created_at, '%m.%Y') as label, AVG(mood_value) as value 
                FROM mood_logs 
                WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY MONTH(created_at), DATE_FORMAT(created_at, '%m.%Y')
                ORDER BY MONTH(created_at) ASC
            """, (current_user_id,))
            
        else:
            return jsonify({"status": "error", "message": "Невідомий період"}), 400

        data = cursor.fetchall()
        
        # Оскільки AVG() в базі може повернути довге число (наприклад 7.33333), 
        # ми його акуратно округлюємо до 1 цифри після коми для красивого графіка
        for item in data:
            if isinstance(item['value'], float) or type(item['value']).__name__ == 'Decimal':
                item['value'] = round(float(item['value']), 1)

        return jsonify({
            "status": "success", 
            "period_selected": period,
            "chart_data": data
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()