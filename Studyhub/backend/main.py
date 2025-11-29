from flask import Flask, request, jsonify
from flask_cors import CORS
from notes import add_note, get_notes
FIREBASE_KEY_PATH='serviceAccountKey.json'

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can access API

@app.route('/')
def home():
    return "Studyhub backend is running!"

@app.route('/add_note', methods=['POST'])
def api_add_note():
    data = request.get_json()
    required_fields = ['grade','subject','title','content','author']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    add_note(
        grade=data['grade'],
        subject=data['subject'],
        title=data['title'],
        content=data['content'],
        author=data['author']
    )
    return jsonify({"message": "Note added successfully"})

@app.route('/get_notes')
def api_get_notes():
    grade = request.args.get('grade')
    subject = request.args.get('subject')

    if not grade or not subject:
        return jsonify({"error": "Please provide both grade and subject"}), 400

    notes_list = get_notes(grade, subject)
    return jsonify(notes_list)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)  # Deta Space prefers 8000
