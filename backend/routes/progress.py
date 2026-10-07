from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import ProgressLog

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")


@progress_bp.post("/log")
@jwt_required()
def log_entry():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}

    try:
        log_date = datetime.strptime(data.get("date"), "%Y-%m-%d").date() if data.get("date") else datetime.utcnow().date()
        screen_time_hours = float(data["screen_time_hours"])
        sleep_hours = float(data["sleep_hours"])
    except (KeyError, ValueError, TypeError):
        return jsonify({"error": "date (YYYY-MM-DD), screen_time_hours and sleep_hours are required"}), 400

    entry = ProgressLog.query.filter_by(user_id=user_id, log_date=log_date).first()
    if entry:
        entry.screen_time_hours = screen_time_hours
        entry.sleep_hours = sleep_hours
    else:
        entry = ProgressLog(
            user_id=user_id,
            log_date=log_date,
            screen_time_hours=screen_time_hours,
            sleep_hours=sleep_hours,
        )
        db.session.add(entry)

    db.session.commit()
    return jsonify({"entry": entry.to_dict()}), 201


@progress_bp.get("/weekly")
@jwt_required()
def weekly():
    user_id = get_jwt_identity()
    since = datetime.utcnow().date() - timedelta(days=6)

    entries = (
        ProgressLog.query.filter(ProgressLog.user_id == user_id, ProgressLog.log_date >= since)
        .order_by(ProgressLog.log_date.asc())
        .all()
    )

    data = [e.to_dict() for e in entries]

    screen_vals = [e["screen_time_hours"] for e in data]
    sleep_vals = [e["sleep_hours"] for e in data]

    screen_change = None
    sleep_change = None
    if len(screen_vals) >= 2 and screen_vals[0] != 0:
        screen_change = round(((screen_vals[-1] - screen_vals[0]) / screen_vals[0]) * 100)
    if len(sleep_vals) >= 2 and sleep_vals[0] != 0:
        sleep_change = round(((sleep_vals[-1] - sleep_vals[0]) / sleep_vals[0]) * 100)

    return jsonify({
        "entries": data,
        "screen_time_change_pct": screen_change,
        "sleep_change_pct": sleep_change,
    }), 200
