# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import bleach
import mysql.connector
from database import get_db_connection

notes_bp = Blueprint('notes', __name__)

# --- 1. ДОДАВАННЯ НОТАТКИ ---
@notes_bp.route('/', methods=['POST'])
@jwt_required()
def add_note():
    data = request.json
    current_user_id = get_jwt_identity() 
    
    raw_title = data.get('title')
    raw_content = data.get('content') 

    safe_title = bleach.clean(raw_title) if raw_title else ""
    safe_content = bleach.clean(raw_content) if raw_content else ""

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO notes (user_id, title, content) VALUES (%s, %s, %s)", (current_user_id, safe_title, safe_content))
        conn.commit()
        return jsonify({"status": "success", "message": "Нотатку збережено!"}), 201
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 2. ОТРИМАННЯ НОТАТОК (Оновлено: Сортування по закріпленню) ---
@notes_bp.route('/', methods=['GET'])
@jwt_required()  
def get_notes():
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        # Тепер ми спочатку сортуємо по is_pinned (щоб закріплені були зверху), а вже потім по даті створення
        cursor.execute(
            "SELECT id, title, content, is_pinned, created_at FROM notes WHERE user_id = %s ORDER BY is_pinned DESC, created_at DESC", 
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


# --- 3. ВИДАЛЕННЯ НОТАТКИ (НОВЕ) ---
# <int:note_id> означає, що фронтенд передає ID нотатки прямо в посиланні (напр. /api/notes/5)
@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    current_user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # КРИТИЧНО ВАЖЛИВО: Перевіряємо, чи належить ця нотатка поточному юзеру (захист від хакерів)
        cursor.execute("DELETE FROM notes WHERE id = %s AND user_id = %s", (note_id, current_user_id))
        conn.commit()
        
        # Якщо жодного рядка не видалено, значить такої нотатки немає, або вона чужа
        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Нотатку не знайдено або у вас немає прав на її видалення"}), 404

        return jsonify({"status": "success", "message": "Нотатку назавжди видалено!"}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- 4. РЕДАГУВАННЯ ТА ЗАКРІПЛЕННЯ (НОВЕ) ---
@notes_bp.route('/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    current_user_id = get_jwt_identity()
    data = request.json
    
    raw_title = data.get('title')
    raw_content = data.get('content')
    # get() поверне значення або None. Ми конвертуємо його в bool (True/False)
    is_pinned = bool(data.get('is_pinned', False))

    safe_title = bleach.clean(raw_title) if raw_title else ""
    safe_content = bleach.clean(raw_content) if raw_content else ""

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Оновлюємо текст і статус закріплення
        cursor.execute(
            "UPDATE notes SET title = %s, content = %s, is_pinned = %s WHERE id = %s AND user_id = %s", 
            (safe_title, safe_content, is_pinned, note_id, current_user_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Нотатку не знайдено або у вас немає прав на її редагування"}), 404

        return jsonify({"status": "success", "message": "Нотатку оновлено!"}), 200
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()