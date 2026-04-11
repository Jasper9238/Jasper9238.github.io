from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app) 

DB_FILE = 'db.json'


def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": {}}
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password') 
    
    db = load_db()
    if username in db['users']:
        user = db['users'].get(data.get('username'))
        if user and user['password'] == data.get('password'):
            return jsonify({"error": "Try logging in?"}), 400
        else:
            return jsonify({"error": "User exists"}), 400
    
    db['users'][username] = {"password": password, "qrs": []}
    save_db(db)
    return jsonify({"success": True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    db = load_db()
    user = db['users'].get(data.get('username'))
    
    if user and user['password'] == data.get('password'):
        return jsonify({"success": True, "username": data.get('username')})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/save-qr', methods=['POST'])
def save_qr():
    data = request.json
    db = load_db()
    username = data.get('username')
    
    if username in db['users']:
        db['users'][username]['qrs'].append({
            "token": data.get('token'),
            "target": data.get('target')
        })
        save_db(db)
        return jsonify({"success": True})
    return jsonify({"error": "User not found"}), 404

@app.route('/api/get-history', methods=['GET'])
def get_history():
    username = request.args.get('username')
    db = load_db()
    user_data = db['users'].get(username, {"qrs": []})
    return jsonify({"qrs": user_data['qrs']})

if __name__ == '__main__':
    app.run(port=5000, debug=True)