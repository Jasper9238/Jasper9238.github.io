from firebase_setup import db
from datetime import datetime
from google.cloud import firestore # Needed for DESCENDING order

# --- CREATE/ADD FUNCTION (Existing, fixed) ---
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

# --- LIST/INDEX FUNCTION (Modified to include ID) ---
def get_notes(grade, subject):
    notes_ref = db.collection('notes')
    query = notes_ref.where("grade", "==", grade).where("subject", "==", subject).order_by("dateCreated", direction=firestore.Query.DESCENDING)
    
    results = query.stream()
    notes_list = []
    for note in results:
        data = note.to_dict()
        data['id'] = note.id # <-- NEW: Include the unique Firestore ID
        notes_list.append(data)
    return notes_list

# --- DETAIL FUNCTION (NEW) ---
def get_note_by_id(note_id):
    note_ref = db.collection('notes').document(note_id)
    note_doc = note_ref.get()
    
    if note_doc.exists:
        data = note_doc.to_dict()
        data['id'] = note_doc.id 
        return data
    return None

# --- COMMENT FETCH FUNCTION (NEW) ---
def get_comments_for_post(post_id):
    comments_ref = db.collection('comments')
    # Order by dateCreated DESCENDING so newest comments appear first
    query = comments_ref.where("postId", "==", post_id).order_by("dateCreated", direction=firestore.Query.DESCENDING)
    
    results = query.stream()
    comments_list = []
    for comment in results:
        data = comment.to_dict()
        data['id'] = comment.id # Include comment ID (useful for future features)
        comments_list.append(data)
    return comments_list

# --- COMMENT ADD FUNCTION (NEW) ---
def add_comment(post_id, content, author_id):
    comment_data = {
        "postId": post_id,
        "content": content,
        "authorId": author_id,
        "dateCreated": datetime.utcnow()
    }
    db.collection('comments').add(comment_data)
    print(f"Comment added to post {post_id}")