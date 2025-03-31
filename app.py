import os
import json
import time
import asyncio
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import subprocess
import threading
from python_server.storage import storage
from python_server.gemini_service import (
    generate_study_recommendations,
    generate_flashcards_from_notes,
    enhance_notes,
    generate_concept_map
)

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='client/dist', static_url_path='/')
CORS(app)

# Logging middleware
@app.before_request
def start_timer():
    request.start_time = time.time()

@app.after_request
def log_request(response):
    if request.path.startswith('/api'):
        duration = int((time.time() - request.start_time) * 1000)
        status_code = response.status_code
        method = request.method
        path = request.path
        
        # Try to get response data for logging
        response_data = None
        if response.content_type == 'application/json':
            try:
                response_data = json.loads(response.get_data(as_text=True))
                log_line = f"{method} {path} {status_code} in {duration}ms :: {json.dumps(response_data)}"
                if len(log_line) > 80:
                    log_line = log_line[:79] + "…"
                print(f"[express] {log_line}")
            except:
                print(f"[express] {method} {path} {status_code} in {duration}ms")
        else:
            print(f"[express] {method} {path} {status_code} in {duration}ms")
    
    return response

# Error handling
@app.errorhandler(Exception)
def handle_error(e):
    status_code = 500
    if hasattr(e, 'code'):
        status_code = e.code
    return jsonify({"message": str(e)}), status_code

# USER ENDPOINTS
@app.route("/api/user", methods=["GET"])
def get_current_user():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Don't send password
    user_dict = user.copy()
    user_dict.pop('password', None)
    return jsonify(user_dict)

# TASKS ENDPOINTS
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    tasks = storage.get_tasks(user["id"])
    return jsonify(tasks)

@app.route("/api/tasks", methods=["POST"])
def create_task():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    task_data = request.json
    task_data["userId"] = user["id"]
    
    task = storage.create_task(task_data)
    return jsonify(task), 201

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task_data = request.json
    updated_task = storage.update_task(task_id, task_data)
    
    if not updated_task:
        return jsonify({"message": "Task not found"}), 404
    
    return jsonify(updated_task)

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    success = storage.delete_task(task_id)
    
    if not success:
        return jsonify({"message": "Task not found"}), 404
    
    return "", 204

# STUDY SESSIONS ENDPOINTS
@app.route("/api/study-sessions", methods=["GET"])
def get_study_sessions():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    sessions = storage.get_study_sessions(user["id"])
    return jsonify(sessions)

@app.route("/api/study-sessions", methods=["POST"])
def create_study_session():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    session_data = request.json
    session_data["userId"] = user["id"]
    
    session = storage.create_study_session(session_data)
    return jsonify(session), 201

@app.route("/api/study-sessions/<int:session_id>", methods=["PUT"])
def update_study_session(session_id):
    session_data = request.json
    updated_session = storage.update_study_session(session_id, session_data)
    
    if not updated_session:
        return jsonify({"message": "Study session not found"}), 404
    
    return jsonify(updated_session)

@app.route("/api/study-sessions/<int:session_id>", methods=["DELETE"])
def delete_study_session(session_id):
    success = storage.delete_study_session(session_id)
    
    if not success:
        return jsonify({"message": "Study session not found"}), 404
    
    return "", 204

# NOTES ENDPOINTS
@app.route("/api/notes", methods=["GET"])
def get_notes():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    notes = storage.get_notes(user["id"])
    return jsonify(notes)

@app.route("/api/notes", methods=["POST"])
def create_note():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    note_data = request.json
    note_data["userId"] = user["id"]
    
    note = storage.create_note(note_data)
    return jsonify(note), 201

@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    note_data = request.json
    updated_note = storage.update_note(note_id, note_data)
    
    if not updated_note:
        return jsonify({"message": "Note not found"}), 404
    
    return jsonify(updated_note)

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    success = storage.delete_note(note_id)
    
    if not success:
        return jsonify({"message": "Note not found"}), 404
    
    return "", 204

# AI Enhanced Notes
@app.route("/api/notes/enhance", methods=["POST"])
def enhance_notes_route():
    data = request.json
    notes = data.get("notes")
    subject = data.get("subject")
    
    if not notes or not subject:
        return jsonify({"message": "Notes and subject are required"}), 400
    
    try:
        enhanced = enhance_notes(notes, subject)
        return jsonify(enhanced)
    except Exception as e:
        print("Error enhancing notes:", str(e))
        return jsonify({"message": "Failed to enhance notes", "error": str(e)}), 500

# FLASHCARD SETS ENDPOINTS
@app.route("/api/flashcard-sets", methods=["GET"])
def get_flashcard_sets():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    sets = storage.get_flashcard_sets(user["id"])
    return jsonify(sets)

@app.route("/api/flashcard-sets", methods=["POST"])
def create_flashcard_set():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    set_data = request.json
    set_data["userId"] = user["id"]
    
    flashcard_set = storage.create_flashcard_set(set_data)
    return jsonify(flashcard_set), 201

@app.route("/api/flashcard-sets/<int:set_id>", methods=["GET"])
def get_flashcard_set(set_id):
    flashcard_set = storage.get_flashcard_set_by_id(set_id)
    
    if not flashcard_set:
        return jsonify({"message": "Flashcard set not found"}), 404
    
    flashcards = storage.get_flashcards(set_id)
    result = {**flashcard_set, "flashcards": flashcards}
    return jsonify(result)

@app.route("/api/flashcard-sets/<int:set_id>", methods=["PUT"])
def update_flashcard_set(set_id):
    set_data = request.json
    updated_set = storage.update_flashcard_set(set_id, set_data)
    
    if not updated_set:
        return jsonify({"message": "Flashcard set not found"}), 404
    
    return jsonify(updated_set)

@app.route("/api/flashcard-sets/<int:set_id>", methods=["DELETE"])
def delete_flashcard_set(set_id):
    success = storage.delete_flashcard_set(set_id)
    
    if not success:
        return jsonify({"message": "Flashcard set not found"}), 404
    
    return "", 204

# FLASHCARDS ENDPOINTS
@app.route("/api/flashcard-sets/<int:set_id>/flashcards", methods=["GET"])
def get_flashcards(set_id):
    flashcards = storage.get_flashcards(set_id)
    return jsonify(flashcards)

@app.route("/api/flashcard-sets/<int:set_id>/flashcards", methods=["POST"])
def create_flashcard(set_id):
    # Check if set exists
    flashcard_set = storage.get_flashcard_set_by_id(set_id)
    if not flashcard_set:
        return jsonify({"message": "Flashcard set not found"}), 404
    
    flashcard_data = request.json
    flashcard_data["setId"] = set_id
    
    flashcard = storage.create_flashcard(flashcard_data)
    return jsonify(flashcard), 201

# AI Generated Flashcards
@app.route("/api/flashcards/generate", methods=["POST"])
def generate_flashcards():
    data = request.json
    notes = data.get("notes")
    subject = data.get("subject")
    count = data.get("count", 5)
    
    if not notes or not subject:
        return jsonify({"message": "Notes and subject are required"}), 400
    
    try:
        flashcards = generate_flashcards_from_notes(notes, subject, count)
        return jsonify(flashcards)
    except Exception as e:
        print("Error generating flashcards:", str(e))
        return jsonify({"message": "Failed to generate flashcards", "error": str(e)}), 500

# STUDY PROGRESS ENDPOINTS
@app.route("/api/study-progress", methods=["GET"])
def get_study_progress():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    progress = storage.get_study_progress(user["id"])
    return jsonify(progress)

@app.route("/api/study-progress", methods=["POST"])
def create_study_progress():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    progress_data = request.json
    progress_data["userId"] = user["id"]
    
    progress = storage.create_study_progress(progress_data)
    return jsonify(progress), 201

# AI RECOMMENDATIONS
@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    try:
        # For demo purposes, use fixed values
        recent_topics = ["Algorithms", "Data Structures", "Database Design"]
        upcoming_exams = ["Database Midterm", "Algorithm Final"]
        struggling_areas = ["Graph Algorithms", "SQL Optimization"]
        
        recommendations = generate_study_recommendations(
            recent_topics,
            upcoming_exams,
            struggling_areas
        )
        
        return jsonify(recommendations)
    except Exception as e:
        print("Error generating recommendations:", str(e))
        return jsonify({"message": "Failed to generate recommendations", "error": str(e)}), 500

# CONCEPT MAP
@app.route("/api/concept-map", methods=["GET"])
def get_concept_map():
    topic = request.args.get("topic")
    notes = request.args.get("notes")
    
    if not topic:
        return jsonify({"message": "Topic is required as a query parameter"}), 400
    
    try:
        concept_map = generate_concept_map(topic, notes)
        return jsonify(concept_map)
    except Exception as e:
        print("Error generating concept map:", str(e))
        return jsonify({"message": "Failed to generate concept map", "error": str(e)}), 500

# CONCEPT MAP with POST (for larger text input)
@app.route("/api/concept-map", methods=["POST"])
def create_concept_map():
    data = request.json
    topic = data.get("topic")
    notes = data.get("notes")
    
    if not topic:
        return jsonify({"message": "Topic is required in the request body"}), 400
    
    try:
        concept_map = generate_concept_map(topic, notes)
        return jsonify(concept_map)
    except Exception as e:
        print("Error generating concept map:", str(e))
        return jsonify({"message": "Failed to generate concept map", "error": str(e)}), 500

# CONCEPT FLASHCARDS - generate flashcards for a specific concept
@app.route("/api/concept-flashcards", methods=["POST"])
def generate_concept_flashcards():
    data = request.json
    concept = data.get("concept")
    description = data.get("description")
    bullet_points = data.get("bulletPoints")
    
    if not concept:
        return jsonify({"message": "Concept name is required in the request body"}), 400
    
    try:
        # Prepare prompt content by combining description and bullet points
        content_for_flashcards = concept
        
        if description:
            content_for_flashcards += f"\n\nDescription: {description}"
        
        if bullet_points and isinstance(bullet_points, list) and len(bullet_points) > 0:
            content_for_flashcards += f"\n\nKey Points:\n{chr(10).join([f'- {point}' for point in bullet_points])}"
        
        # Generate flashcards using the existing function - increase count for more comprehensive learning
        flashcards = generate_flashcards_from_notes(content_for_flashcards, concept, 7)
        return jsonify(flashcards)
    except Exception as e:
        print("Error generating concept flashcards:", str(e))
        return jsonify({"message": "Failed to generate flashcards", "error": str(e)}), 500

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

if __name__ == "__main__":
    print("[express] serving on port 5001")
    app.run(host="0.0.0.0", port=5001)