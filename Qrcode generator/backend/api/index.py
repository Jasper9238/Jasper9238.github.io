import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)

# 1. SETUP CREDENTIALS
# Get these from Supabase -> Settings -> API
SUPABASE_URL = "https://ooiogdupouhekakuamig.supabase.co"
SUPABASE_KEY = "sb_publishable_YzxoDVla1vny-J8FI7tKKw_QMMrIG8U"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        # Insert into 'profiles' table
        res = supabase.table("profiles").insert({
            "username": data['username'],
            "password_hash": data['password'] 
        }).execute()
        return jsonify({"success": True, "username":data['username']})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/save-qr', methods=['POST'])
def save_qr():
    data = request.json
    try:
        # 1. Get the profile ID for this username
        user = supabase.table("profiles").select("id").eq("username", data['username']).single().execute()
        
        if user.data:
            # 2. Save the QR token linked to this user
            supabase.table("qrs").insert({
                "profile_id": user.data['id'],
                "token": data['token'],
                "target_url": data['target']
            }).execute()
            return jsonify({"success": True})
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    try:
        # 1. Look for the user in the database
        res = supabase.table("profiles") \
            .select("id", "password_hash") \
            .eq("username", data['username']) \
            .single() \
            .execute()

        user = res.data
        if not user:
            return jsonify({"error": "User not found"}), 404

        # 2. Check the password
        # Note: In a production app, we would use bcrypt.checkpw() here!
        if user['password_hash'] == data['password']:
            return jsonify({
                "success": True, 
                "user_id": user['id'],
                "username": data['username']
            })
        else:
            return jsonify({"error": "Invalid password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/my-qrs', methods=['GET'])
def get_my_qrs():
    username = request.args.get('username') # Get username from URL query
    try:
        # 1. Find the user ID
        user = supabase.table("profiles").select("id").eq("username", username).single().execute()
        
        if user.data:
            # 2. Get all QRs where profile_id matches
            qrs = supabase.table("qrs").select("*").eq("profile_id", user.data['id']).execute()
            return jsonify({"success": True, "qrs": qrs.data})
        
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# This is required for Vercel
def handler(request):
    return app(request)

if __name__ == "__main__":
    app.run(debug=True, port=5000)