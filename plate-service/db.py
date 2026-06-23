# plate-service/db.py
from pymongo import MongoClient
import os

def get_db():
    client = MongoClient(os.environ.get("MONGODB_URI"))
    return client.get_database("nvr_db")