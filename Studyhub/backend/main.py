from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import auth # We only need 'auth' here for token verification
from notes import add_note, get_notes # <-- Keep these imports!
# You will not need 'from firebase_admin import db' anymore in main.py, 
# as 'db' is imported and used inside notes.py
# FIREBASE_KEY_PATH='serviceAccountKey.json'


# --- PROTECTED ROUTE DECORATOR ---
def protected_route(f):
    """
    Decorator to verify the Firebase ID Token sent from the frontend.
    If valid, the user's ID (uid) is passed to the API function.
    """
    def decorated_function(*args, **kwargs):
        # 1. Get the Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith('Bearer '): # Note the space after Bearer
            return jsonify({'message': 'Authorization required. Token missing or invalid format.'}), 401
        
        id_token = auth_header.split('Bearer ')[1] # Gets the token part

        try:
            # 2. Verify the token with Firebase
            decoded_token = auth.verify_id_token(id_token)
            user_uid = decoded_token['uid']
            
            # 3. Pass the verified UID to the endpoint function
            kwargs['uid'] = user_uid
            
            # Run the original endpoint function
            return f(*args, **kwargs)
            
        except Exception as e:
            # Token is invalid, expired, or revoked
            print(f'Token verification failed: {e}')
            return jsonify({'message':'Invalid or expired token.'}), 403
        
    decorated_function.__name__ = f.__name__
    return decorated_function


# --- FLASK APP INITIALIZATION ---
app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/')
def home():
    return "Studyhub backend is running!"


@app.route('/add_note', methods=['POST'])
@protected_route
def api_add_note(uid):
    # This code only runs if the token is valid and 'uid' is verified.
    data = request.get_json()
    
    # 1. Attach the verified user ID to the data
    data['authorId'] = uid 
    
    # 2. Check for required fields (I am assuming 'author' is now redundant)
    required_fields = ['grade','subject','title','content','category'] 

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # 3. Call your existing, trusted function from notes.py
    # We pass the collected data, including the secure 'authorId'
    add_note(
        grade=data['grade'],
        subject=data['subject'],
        title=data['title'],
        content=data['content'],
        # IMPORTANT: We are using the secure uid as the author for the database
        author=uid, # Use the verified UID instead of the author field from the frontend
        category=data['category']
    )
    
    return jsonify({"message": "Note added successfully"}), 201


# --- UNPROTECTED ROUTE: /get_notes ---
@app.route('/get_notes')
# REMOVE: @protected_route (Do NOT put it here if you want public viewing!)
def api_get_notes():
    grade = request.args.get('grade')
    subject = request.args.get('subject')

    if not grade or not subject:
        return jsonify({"error": "Please provide both grade and subject"}), 400

    # Call your function from notes.py
    notes_list = get_notes(grade, subject)
    
    # The notes_list is returned. Since Firestore rules allow public read access, 
    # the request from the backend to the database will succeed.
    return jsonify(notes_list) 


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)