import firebase_admin
from firebase_admin import credentials, firestore
import os

FIREBASE_KEY_PATH = 'serviceAccountKey.json'

cred = credentials.Certificate(FIREBASE_KEY_PATH)
firebase_admin.initialize_app(cred)

db = firestore.client()
print("Firebase successfully initialized :D")
