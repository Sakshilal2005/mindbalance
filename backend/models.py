from datetime import datetime
import json
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assessments = db.relationship("AssessmentResult", backref="user", lazy=True, cascade="all, delete-orphan")
    progress_logs = db.relationship("ProgressLog", backref="user", lazy=True, cascade="all, delete-orphan")
    journal_entries = db.relationship("JournalEntry", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class AssessmentResult(db.Model):
    __tablename__ = "assessment_results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    answers_json = db.Column(db.Text, nullable=False)  # raw submitted answers

    wellness_score = db.Column(db.Integer, nullable=False)
    wellness_label = db.Column(db.String(64), nullable=False)

    phone_risk_score = db.Column(db.Integer, nullable=False)
    phone_risk_label = db.Column(db.String(32), nullable=False)

    sleep_risk_score = db.Column(db.Integer, nullable=False)
    sleep_risk_label = db.Column(db.String(32), nullable=False)

    focus_score = db.Column(db.Integer, nullable=False)
    focus_label = db.Column(db.String(32), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "answers": json.loads(self.answers_json),
            "wellness_score": self.wellness_score,
            "wellness_label": self.wellness_label,
            "phone_risk_score": self.phone_risk_score,
            "phone_risk_label": self.phone_risk_label,
            "sleep_risk_score": self.sleep_risk_score,
            "sleep_risk_label": self.sleep_risk_label,
            "focus_score": self.focus_score,
            "focus_label": self.focus_label,
            "created_at": self.created_at.isoformat(),
        }


class ProgressLog(db.Model):
    __tablename__ = "progress_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    log_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    screen_time_hours = db.Column(db.Float, nullable=False)
    sleep_hours = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "log_date", name="uq_user_date"),)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.log_date.isoformat(),
            "screen_time_hours": self.screen_time_hours,
            "sleep_hours": self.sleep_hours,
        }


class JournalEntry(db.Model):
    __tablename__ = "journal_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)

    sentiment = db.Column(db.String(32))
    key_topics_json = db.Column(db.Text)  # JSON list
    suggestion = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "sentiment": self.sentiment,
            "key_topics": json.loads(self.key_topics_json) if self.key_topics_json else [],
            "suggestion": self.suggestion,
            "created_at": self.created_at.isoformat(),
        }
