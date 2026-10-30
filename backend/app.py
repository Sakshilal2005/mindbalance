from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt, jwt

from routes.auth import auth_bp
from routes.assessment import assessment_bp
from routes.progress import progress_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    app.register_blueprint(auth_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(progress_bp)
    

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @jwt.unauthorized_loader
    def unauthorized(reason):
        return jsonify({"error": "missing or invalid token"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"error": "token expired, please log in again"}), 401

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
