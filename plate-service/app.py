# plate-service/app.py
# Routes:
#   POST /plates/generate     — called by vehicle-service on approval
#   GET  /api/plates/verify/:plate_number — public plate lookup
#   GET  /health
#
# /plates/generate has NO /api prefix — this matches exactly what
# vehicle-service calls: axios.post(`${PLATE_SERVICE_URL}/plates/generate`)
# The verify route DOES have /api prefix since the frontend hits it
# through api-gateway at /api/plates/verify/:plate

import os
import random
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime, timedelta
from db import get_db

app = Flask(__name__)
CORS(app)

db = get_db()
plates_collection = db.plates


def serialize_plate(plate):
    """Convert ObjectId fields to strings for JSON serialization."""
    plate["_id"] = str(plate["_id"])
    if "vehicleId" in plate:
        plate["vehicleId"] = str(plate["vehicleId"])
    return plate


def generate_unique_plate():
    """
    Generates a plate number in ABC-1234 format.
    Checks for collisions and retries until a unique one is found.
    Collision probability is extremely low (~1 in 175 million combinations)
    but we check anyway for correctness.
    """
    while True:
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        digits = ''.join(random.choices(string.digits, k=4))
        candidate = f"{letters}-{digits}"
        if not plates_collection.find_one({"plateNumber": candidate}):
            return candidate


# POST /plates/generate
# Called internally by vehicle-service when an admin approves a vehicle.
# No /api prefix — vehicle-service calls this directly by service name.
@app.route("/plates/generate", methods=["POST"])
def generate_plate():
    data = request.get_json()
    vehicle_id = data.get("vehicle_id")

    if not vehicle_id:
        return jsonify({"error": "vehicle_id is required"}), 400

    plate_number = generate_unique_plate()

    new_plate = {
        "plateNumber": plate_number,
        "vehicleId": ObjectId(vehicle_id),
        "issuedDate": datetime.utcnow(),
        "expiryDate": datetime.utcnow() + timedelta(days=365),
        "status": "valid",
    }

    result = plates_collection.insert_one(new_plate)
    new_plate["_id"] = result.inserted_id

    # vehicle-service reads plateRes.data.plate_number — must match this key
    return jsonify({
        "message": "Plate generated",
        "plate_number": plate_number,
        "plate": serialize_plate(new_plate),
    }), 201


# GET /api/plates/verify/<plate_number>
# Called by the public PlateVerification page through api-gateway.
@app.route("/api/plates/verify/<plate_number>", methods=["GET"])
def verify_plate(plate_number):
    plate = plates_collection.find_one({"plateNumber": plate_number.upper()})

    if not plate:
        return jsonify({"message": "Plate not found", "valid": False}), 404

    is_expired = plate["expiryDate"] < datetime.utcnow()
    status = "expired" if is_expired else plate["status"]

    return jsonify({
        "valid": status == "valid",
        "status": status,
        "plate": serialize_plate(plate),
    }), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "plate-service"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3003))
    app.run(host="0.0.0.0", port=port)