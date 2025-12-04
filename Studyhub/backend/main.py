from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import auth 
# Import all new functions from notes.py
from notes import add_note, get_notes, get_note_by_id, get_comments_for_post, add_comment 
from functools import wraps # For decorator name fix

# --- PROTECTED ROUTE DECORATOR (unchanged) ---
def protected_route(f):
    @wraps(f) # Ensures Flask recognizes the decorated function's name
    def decorated_function(*args, **kwargs):
        # ... (Token verification logic as before) ...
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Authorization required. Token missing or invalid format.'}), 401
        
        id_token = auth_header.split('Bearer ')[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            user_uid = decoded_token['uid']
            kwargs['uid'] = user_uid
            
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f'Token verification failed: {e}')
            return jsonify({'message':'Invalid or expired token.'}), 403
            
    return decorated_function


# --- FLASK APP INITIALIZATION (unchanged) ---
app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Studyhub backend is running!"


# --- PROTECTED ROUTE: /add_note (unchanged logic) ---
@app.route('/add_note', methods=['POST'])
@protected_route
def api_add_note(uid):
    data = request.get_json()
    
    required_fields = ['grade','subject','title','content','category'] 

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    add_note(
        grade=data['grade'],
        subject=data['subject'],
        title=data['title'],
        content=data['content'],
        author=uid,
        category=data['category']
    )
    
    return jsonify({"message": "Note added successfully"}), 201


# --- UNPROTECTED ROUTE: /get_notes (unchanged logic) ---
@app.route('/get_notes')
def api_get_notes():
    grade = request.args.get('grade')
    subject = request.args.get('subject')

    if not grade or not subject:
        return jsonify({"error": "Please provide both grade and subject"}), 400

    notes_list = get_notes(grade, subject)
    return jsonify(notes_list) 


# --- DYNAMIC ROUTE: /get_note/<note_id> (NEW) ---
@app.route('/get_note/<note_id>')
def api_get_note_detail(note_id):
    # Fetch the main post data
    note_data = get_note_by_id(note_id) 
    
    if not note_data:
        return jsonify({"error": "Post not found"}), 404
    
    # Fetch all comments for this post
    comments = get_comments_for_post(note_id)
    
    # Combine the post and its comments into one response
    note_data['comments'] = comments 
    
    return jsonify(note_data)


# --- PROTECTED ROUTE: /add_comment (NEW) ---
@app.route('/add_comment', methods=['POST'])
@protected_route
def api_add_comment(uid):
    data = request.get_json()
    
    required_fields = ['postId', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    add_comment(
        post_id=data['postId'],
        content=data['content'],
        author_id=uid
    )
    
    return jsonify({"message": "Comment added successfully"}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)