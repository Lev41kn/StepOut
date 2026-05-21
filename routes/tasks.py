# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
import mysql.connector
from database import get_db_connection

tasks_bp = Blueprint('tasks', __name__)


# --- 1. GET TODAY'S TASKS (Home Screen) ---
@tasks_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_tasks():
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Look for all tasks assigned today, ordered by ID (oldest first)
        cursor.execute("""
                       SELECT ut.id as user_task_id, t.description, ut.is_completed
                       FROM user_tasks ut
                                JOIN tasks t ON ut.task_id = t.id
                       WHERE ut.user_id = %s
                         AND ut.assigned_date = %s
                       ORDER BY ut.id ASC
                       """, (current_user_id, today))

        today_tasks = cursor.fetchall()

        # If no tasks exist for today, assign exactly 1 random one automatically (The Daily Task!)
        if not today_tasks:
            cursor.execute("SELECT id, description FROM tasks ORDER BY RAND() LIMIT 1")
            new_daily = cursor.fetchone()

            if new_daily:
                cursor.execute("""
                               INSERT INTO user_tasks (user_id, task_id, assigned_date, is_completed)
                               VALUES (%s, %s, %s, 0)
                               """, (current_user_id, new_daily['id'], today))
                conn.commit()

                today_tasks = [{
                    "user_task_id": cursor.lastrowid,
                    "description": new_daily['description'],
                    "is_completed": 0
                }]

        # The FIRST task is the Daily Task. The REST are the Active Tasks.
        daily_task = today_tasks[0] if today_tasks else None
        active_tasks = today_tasks[1:] if len(today_tasks) > 1 else []

        return jsonify({
            "status": "success",
            "daily_task": daily_task,
            "active_tasks": active_tasks
        }), 200

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 2. GET SUGGESTIONS (Tasks Screen) ---
@tasks_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Grab 3 random tasks that the user HAS NOT picked today
        cursor.execute("""
                       SELECT id, description
                       FROM tasks
                       WHERE id NOT IN (SELECT task_id
                                        FROM user_tasks
                                        WHERE user_id = %s AND assigned_date = %s)
                       ORDER BY RAND() LIMIT 3
                       """, (current_user_id, today))

        suggestions = cursor.fetchall()

        return jsonify({"status": "success", "suggestions": suggestions}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 3. PICK A TASK (User adds an Active Task) ---
@tasks_bp.route('/pick', methods=['POST'])
@jwt_required()
def pick_task():
    data = request.json
    task_id = data.get('task_id')
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Count today's tasks. (Max is 4: 1 Daily + 3 Active)
        cursor.execute("SELECT COUNT(*) as total FROM user_tasks WHERE user_id = %s AND assigned_date = %s",
                       (current_user_id, today))
        count = cursor.fetchone()['total']

        if count >= 4:
            return jsonify({"status": "error", "message": "Ви вже обрали максимум завдань на сьогодні."}), 400

        # Insert the chosen task
        cursor.execute("""
                       INSERT INTO user_tasks (user_id, task_id, assigned_date, is_completed)
                       VALUES (%s, %s, %s, 0)
                       """, (current_user_id, task_id, today))

        conn.commit()
        return jsonify({"status": "success", "message": "Завдання додано!"}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 4. TOGGLE TASK COMPLETION & UPDATE STREAK ---
@tasks_bp.route('/toggle/<int:user_task_id>', methods=['PUT'])
@jwt_required()
def toggle_task(user_task_id):
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Flip the is_completed status
        cursor.execute("UPDATE user_tasks SET is_completed = NOT is_completed WHERE id = %s AND user_id = %s",
                       (user_task_id, current_user_id))

        # 2. Check if we need to update the streak (Only update streak if it's not already today)
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
        return jsonify({"status": "success", "streak": new_streak}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 5. GET ARCHIVE (Past Completed Tasks) ---
@tasks_bp.route('/archive', methods=['GET'])
@jwt_required()
def get_archive():
    current_user_id = get_jwt_identity()
    today = date.today()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all completed tasks from BEFORE today
        cursor.execute("""
                       SELECT ut.assigned_date, t.description
                       FROM user_tasks ut
                                JOIN tasks t ON ut.task_id = t.id
                       WHERE ut.user_id = %s
                         AND ut.is_completed = 1
                         AND ut.assigned_date < %s
                       ORDER BY ut.assigned_date DESC
                       """, (current_user_id, today))

        archive = cursor.fetchall()

        # Format dates for frontend
        for item in archive:
            item['assigned_date'] = item['assigned_date'].strftime('%d.%m.%Y')

        return jsonify({"status": "success", "archive": archive}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 6. ВИДАЛЕННЯ ОБРАНОГО ЗАВДАННЯ (UNPICK) ---
@tasks_bp.route('/remove/<int:user_task_id>', methods=['DELETE'])
@jwt_required()
def remove_task(user_task_id):
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Дозволяємо видаляти тільки якщо воно ще НЕ виконане (is_completed = 0)
        cursor.execute("DELETE FROM user_tasks WHERE id = %s AND user_id = %s AND is_completed = 0",
                       (user_task_id, current_user_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error",
                            "message": "Не вдалося скасувати. Можливо, завдання вже виконане на Головному екрані."}), 400

        return jsonify({"status": "success", "message": "Завдання видалено."}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
