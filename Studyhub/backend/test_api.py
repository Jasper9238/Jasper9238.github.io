import requests
import json

# URL where your Flask server is running
BASE_URL = "http://127.0.0.1:5000"

# ----- Test adding a note -----
note_data = {
    "grade": "9",
    "subject": "science",
    "title": "Test Note",
    "content": "This is a test note from the API script.",
    "author": "Jasper"
}

response = requests.post(f"{BASE_URL}/add_note", json=note_data)
print("Add Note Response:")
print(response.status_code)
print(response.json())
print("\n")

# ----- Test getting notes -----
params = {
    "grade": "9",
    "subject": "science"
}

response = requests.get(f"{BASE_URL}/get_notes", params=params)
print("Get Notes Response:")
print(response.status_code)
print(json.dumps(response.json(), indent=2))