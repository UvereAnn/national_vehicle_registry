import os
import random
import string
import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "nvr_db")
    )

def generate_plate():
    """Generate plate in format NVR-XX-NNNN"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=4))
    return f"NVR-{letters}-{numbers}"

def generate_unique_plate():
    """Generate a unique plate number not already in use"""
    db = get_db()
    cursor = db.cursor()
    max_attempts = 100

    for _ in range(max_attempts):
        plate = generate_plate()
        cursor.execute("SELECT id FROM plate_numbers WHERE plate_number = %s", (plate,))
        if not cursor.fetchone():
            cursor.close()
            db.close()
            return plate

    cursor.close()
    db.close()
    raise Exception("Could not generate unique plate after 100 attempts")

@app.route('/health')
def health():
    return jsonify({"status": "ok", "service": "plate-service"})

@app.route('/plates/generate', methods=['POST'])
def generate():
    data = request.get_json()
    vehicle_id = data.get('vehicle_id')

    if not vehicle_id:
        return jsonify({"error": "vehicle_id required"}), 400

    try:
        plate = generate_unique_plate()
        db = get_db()
        cursor = db.cursor()

        # Insert into plate_numbers table
        cursor.execute(
            "INSERT INTO plate_numbers (plate_number, vehicle_id) VALUES (%s, %s)",
            (plate, vehicle_id)
        )
        db.commit()
        cursor.close()
        db.close()

        return jsonify({"plate_number": plate, "vehicle_id": vehicle_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/plates/validate/<plate>', methods=['GET'])
def validate(plate):
    """Check if a plate exists and is valid"""
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT pn.*, v.owner_name, v.make, v.model FROM plate_numbers pn "
            "LEFT JOIN vehicles v ON pn.vehicle_id = v.id WHERE pn.plate_number = %s",
            (plate.upper(),)
        )
        result = cursor.fetchone()
        cursor.close()
        db.close()

        if result:
            return jsonify({"valid": True, "data": result})
        return jsonify({"valid": False}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/plates', methods=['GET'])
def list_plates():
    """List all generated plates"""
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT pn.*, v.owner_name, v.make, v.model FROM plate_numbers pn "
            "LEFT JOIN vehicles v ON pn.vehicle_id = v.id ORDER BY pn.generated_at DESC"
        )
        rows = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 3003))
    app.run(host='0.0.0.0', port=port, debug=os.getenv("DEBUG", "false").lower() == "true")
