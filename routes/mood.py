from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
import mysql.connector
from database import get_db_connection

mood_bp = Blueprint('mood', __name__)


# --- 1. ЗБЕРЕЖЕННЯ НАСТРОЮ ТА ОНОВЛЕННЯ СТРІКУ (UPDATED) ---
@mood_bp.route('/', methods=['POST'])
@jwt_required()
def add_mood():
    data = request.json
    current_user_id = get_jwt_identity()
    try:
        mood_value = float(data.get('mood_value'))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Неправильне значення настрою"}), 400

    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Update or Insert the Mood
        cursor.execute("SELECT id FROM mood_logs WHERE user_id = %s AND created_at = %s", (current_user_id, today))
        existing_mood = cursor.fetchone()

        if existing_mood:
            cursor.execute("UPDATE mood_logs SET mood_value = %s WHERE id = %s", (mood_value, existing_mood['id']))
        else:
            cursor.execute("INSERT INTO mood_logs (user_id, mood_value, created_at) VALUES (%s, %s, %s)",
                           (current_user_id, mood_value, today))

        # 2. STREAK MATH
        cursor.execute("SELECT streak, last_active_date FROM users WHERE id = %s", (current_user_id,))
        user_data = cursor.fetchone()

        current_streak = user_data['streak'] or 0 if user_data and user_data['streak'] else 0
        last_date = user_data['last_active_date'] if user_data else None

        new_streak = current_streak

        if last_date != today:
            yesterday = today - timedelta(days=1)
            if last_date == yesterday:
                new_streak += 1
            else:
                new_streak = 1

            cursor.execute("UPDATE users SET streak = %s, last_active_date = %s WHERE id = %s",
                           (new_streak, today, current_user_id))

        conn.commit()
        return jsonify({"status": "success", "streak": new_streak, "mood": mood_value}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 2. СТАТУС НА СЬОГОДНІ (НОВИЙ МАРШРУТ ДЛЯ HOME SCREEN) ---
@mood_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_status():
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT streak FROM users WHERE id = %s", (current_user_id,))
        user_data = cursor.fetchone()
        streak = user_data['streak'] or 0 if user_data and user_data['streak'] else 0

        cursor.execute("SELECT mood_value FROM mood_logs WHERE user_id = %s AND created_at = %s",
                       (current_user_id, today))
        mood_data = cursor.fetchone()
        today_mood = mood_data['mood_value'] if mood_data else None

        return jsonify({"status": "success", "streak": streak, "today_mood": today_mood}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 3. ОТРИМАННЯ ІСТОРІЇ НАСТРОЮ (ORIGINAL) ---
@mood_bp.route('/', methods=['GET'])
@jwt_required()
def get_mood_history():
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT mood_value, created_at FROM mood_logs WHERE user_id = %s ORDER BY created_at ASC LIMIT 30",
            (current_user_id,)
        )
        mood_history = cursor.fetchall()

        for entry in mood_history:
            entry['created_at'] = entry['created_at'].strftime('%Y-%m-%d')

        return jsonify({"status": "success", "history": mood_history}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": "Помилка бази даних"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 4. ДАНІ ДЛЯ ГРАФІКА (ORIGINAL) ---
@mood_bp.route('/chart', methods=['GET'])
@jwt_required()
def get_mood_chart():
    current_user_id = get_jwt_identity()
    period = request.args.get('period', 'days')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if period == 'days':
            cursor.execute("""
                           SELECT DATE_FORMAT(created_at, '%d.%m') as label, mood_value as value
                           FROM mood_logs
                           WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                           ORDER BY created_at ASC
                           """, (current_user_id,))

        elif period == 'weeks':
            cursor.execute("""
                           SELECT CONCAT('Тиж. ', WEEK(created_at)) as label, AVG(mood_value) as value
                           FROM mood_logs
                           WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
                           GROUP BY WEEK(created_at)
                           ORDER BY WEEK(created_at) ASC
                           """, (current_user_id,))

        elif period == 'months':
            cursor.execute("""
                           SELECT DATE_FORMAT(created_at, '%m.%Y') as label, AVG(mood_value) as value
                           FROM mood_logs
                           WHERE user_id = %s AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                           GROUP BY MONTH (created_at), DATE_FORMAT(created_at, '%m.%Y')
                           ORDER BY MONTH (created_at) ASC
                           """, (current_user_id,))

        else:
            return jsonify({"status": "error", "message": "Невідомий період"}), 400

        data = cursor.fetchall()

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
