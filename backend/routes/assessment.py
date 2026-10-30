import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import AssessmentResult
from scoring import score_assessment, build_recommendations

assessment_bp = Blueprint("assessment", __name__, url_prefix="/api/assessment")

REQUIRED_KEYS = [
    "phone_hours", "phone_checks", "social_hours",
    "sleep_hours", "night_wakes", "phone_before_bed",
    "stress_level", "focus_difficulty", "exercise_freq",
]


@assessment_bp.post("/submit")
@jwt_required()
def submit():
    user_id = get_jwt_identity()
    answers = request.get_json(force=True) or {}

    missing = [k for k in REQUIRED_KEYS if k not in answers]
    if missing:
        return jsonify({"error": f"missing answers: {', '.join(missing)}"}), 400

    result = score_assessment(answers)
    recommendations = build_recommendations(result)

    record = AssessmentResult(
        user_id=user_id,
        answers_json=json.dumps(answers),
        **result,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "assessment": record.to_dict(),
        "recommendations": recommendations,
        
    }), 201


@assessment_bp.get("/latest")
@jwt_required()
def latest():
    user_id = get_jwt_identity()
    record = (
        AssessmentResult.query.filter_by(user_id=user_id)
        .order_by(AssessmentResult.created_at.desc())
        .first()
    )
    

    record_dict = record.to_dict()
    recommendations = build_recommendations(record_dict)
    return jsonify({
        "assessment": record_dict,
        "recommendations": recommendations,
    }), 200


@assessment_bp.get("/history")
@jwt_required()
def history():
    user_id = get_jwt_identity()
    records = (
        AssessmentResult.query.filter_by(user_id=user_id)
        .order_by(AssessmentResult.created_at.asc())
        .all()
    )
    return jsonify({"history": [r.to_dict() for r in records]}), 200
