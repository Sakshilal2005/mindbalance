import json
import re
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import anthropic

from extensions import db
from models import JournalEntry

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")

SYSTEM_PROMPT = """You are an NLP analysis engine inside a digital wellness app called MindBalance.
A user writes a short journal note about their mood, phone habits, or sleep.
Analyze it and respond with ONLY valid JSON, no markdown fences, no extra text, in this exact shape:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "key_topics": ["short phrase", "short phrase", ...],   // 2-5 short topic tags, e.g. "late night usage", "social media", "tiredness"
  "suggestion": "one short, warm, actionable suggestion (max 2 sentences) related to digital wellness/sleep/focus"
}
Do not include any text outside the JSON object."""


def _call_claude(text: str) -> dict:
    api_key = current_app.config.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured on the server")

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=current_app.config.get("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": text}],
    )

    raw = "".join(block.text for block in response.content if block.type == "text").strip()
    # strip stray markdown fences just in case
    raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()

    parsed = json.loads(raw)
    sentiment = parsed.get("sentiment", "Neutral")
    key_topics = parsed.get("key_topics", [])
    suggestion = parsed.get("suggestion", "")
    return {"sentiment": sentiment, "key_topics": key_topics, "suggestion": suggestion}


@insights_bp.post("/analyze")
@jwt_required()
def analyze():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text is required"}), 400
    if len(text) > 2000:
        return jsonify({"error": "text is too long (max 2000 characters)"}), 400

    try:
        analysis = _call_claude(text)
    except json.JSONDecodeError:
        return jsonify({"error": "AI response could not be parsed, please try again"}), 502
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except anthropic.APIError as e:
        print("========== ANTHROPIC ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("=====================================")
        return jsonify({"error": f"AI service error: {str(e)}"}), 502

    except Exception as e:
      print("========== UNKNOWN ERROR ==========")
    print(type(e).__name__)
    print(str(e))
    print("===================================")
    return jsonify({"error": str(e)}), 500

    entry = JournalEntry(
        user_id=user_id,
        text=text,
        sentiment=analysis["sentiment"],
        key_topics_json=json.dumps(analysis["key_topics"]),
        suggestion=analysis["suggestion"],
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"entry": entry.to_dict()}), 201


@insights_bp.get("/history")
@jwt_required()
def history():
    user_id = get_jwt_identity()
    entries = (
        JournalEntry.query.filter_by(user_id=user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200
