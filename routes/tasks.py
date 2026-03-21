# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
import mysql.connector
from database import get_db_connection
from extensions import limiter

tasks_bp = Blueprint('tasks', __name__)

# --- 1. ЩОДЕННИЙ ЧЕК-ІН (ТВІЙ СТАРИЙ КОД - ЗАЛИШАЄТЬСЯ БЕЗ ЗМІН) ---
@tasks_bp.route('/daily_check', methods=['POST'])
@jwt_required()
def daily_check():
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


# --- 2. ОТРИМАННЯ ЗАВДАНЬ НА СЬОГОДНІ (АВТО-ВИДАЧА) ---
@tasks_bp.route('/daily', methods=['GET'])
@jwt_required()
def get_daily_tasks():
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Перевіряємо, чи є вже завдання у юзера на сьогодні
        query = """
            SELECT ut.id as user_task_id, t.description, ut.is_completed 
            FROM user_tasks ut 
            JOIN tasks t ON ut.task_id = t.id 
            WHERE ut.user_id = %s AND ut.assigned_date = %s
        """
        cursor.execute(query, (current_user_id, today))
        today_tasks = cursor.fetchall()
        
        # Якщо завдань на сьогодні ще немає — видаємо 3 нові випадкові!
        if not today_tasks:
            # Беремо 3 випадкових ID з таблиці завдань
            cursor.execute("SELECT id FROM tasks ORDER BY RAND() LIMIT 3")
            random_tasks = cursor.fetchall()
            
            # Призначаємо їх користувачу
            for task in random_tasks:
                cursor.execute("INSERT INTO user_tasks (user_id, task_id, assigned_date) VALUES (%s, %s, %s)", (current_user_id, task['id'], today))
            conn.commit()
            
            # Знову читаємо їх з бази, щоб віддати фронтенду
            cursor.execute(query, (current_user_id, today))
            today_tasks = cursor.fetchall()
            
        return jsonify({"status": "success", "tasks": today_tasks}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 3. ВІДМІТИТИ ЗАВДАННЯ ЯК ВИКОНАНЕ ---
@tasks_bp.route('/complete', methods=['POST'])
@jwt_required()
def complete_task():
    data = request.json
    current_user_id = get_jwt_identity()
    user_task_id = data.get('user_task_id') # ID запису в таблиці user_tasks

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Оновлюємо статус тільки якщо це завдання належить цьому юзеру
        cursor.execute("UPDATE user_tasks SET is_completed = TRUE WHERE id = %s AND user_id = %s", (user_task_id, current_user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Завдання не знайдено або не належить вам"}), 404
            
        return jsonify({"status": "success", "message": "Молодець! Завдання виконано."}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()