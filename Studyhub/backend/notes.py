from firebase_setup import db
from datetime import datetime

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

def get_notes(grade, subject):
    notes_ref = db.collection('notes')
    query = notes_ref.where("grade", "==", grade).where("subject", "==", subject)
    
    results = query.stream()
    notes_list = [note.to_dict() for note in results]
    return notes_list