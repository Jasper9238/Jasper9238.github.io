from firebase_setup import db
from datetime import datetime
from google.cloud import firestore

# --- HELPER FUNCTION: Safely Convert Date to String ---
def serialize_date(data):
    """Checks if data has dateCreated and converts it to a string."""
    if 'dateCreated' in data:
        val = data['dateCreated']
        # Handle Firestore Timestamp
        if hasattr(val, 'isoformat'): 
            data['dateCreated'] = val.isoformat()
        # Handle datetime objects
        elif isinstance(val, datetime):
            data['dateCreated'] = val.isoformat()
        else:
            # Fallback for weird data
            data['dateCreated'] = str(val)
    return data

# --- CREATE/ADD FUNCTION ---
def add_note(grade, subject, title, content, author, category):
    note_data = {
        "grade": grade,
        "subject": subject,
        "title": title,
        "content": content,
        "authorId": author, 
        "category": category,
        "dateCreated": datetime.utcnow()
    }
    db.collection('notes').add(note_data)
    print("Note added")

# --- LIST/INDEX FUNCTION ---
def get_notes(grade, subject):
    notes_ref = db.collection('notes')
    query = notes_ref.where("grade", "==", grade).where("subject", "==", subject).order_by("dateCreated", direction=firestore.Query.DESCENDING)
    
    results = query.stream()
    notes_list = []
    for note in results:
        data = note.to_dict()
        data['id'] = note.id
        
        # 🚨 FIX: Convert date to string immediately
        serialize_date(data)
        
        notes_list.append(data)
    return notes_list

# --- DETAIL FUNCTION ---
def get_note_by_id(note_id):
    note_ref = db.collection('notes').document(note_id)
    note_doc = note_ref.get()
    
    if note_doc.exists:
        data = note_doc.to_dict()
        data['id'] = note_doc.id 
        
        # 🚨 FIX: Convert date to string immediately
        serialize_date(data)
        
        return data
    return None

# --- COMMENT FETCH FUNCTION ---
def get_comments_for_post(post_id):
    comments_ref = db.collection('comments')
    query = comments_ref.where("postId", "==", post_id).order_by("dateCreated", direction=firestore.Query.DESCENDING)
    
    results = query.stream()
    comments_list = []
    for comment in results:
        data = comment.to_dict()
        data['id'] = comment.id
        
        # 🚨 FIX: Convert date to string immediately
        serialize_date(data)
        
        comments_list.append(data)
    return comments_list

# --- COMMENT ADD FUNCTION ---
def add_comment(post_id, content, author_id):
    comment_data = {
        "postId": post_id,
        "content": content,
        "authorId": author_id,
        "dateCreated": datetime.utcnow()
    }
    db.collection('comments').add(comment_data)
    print(f"Comment added to post {post_id}")