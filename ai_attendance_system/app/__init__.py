from flask import Flask
from config import *

def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object('config')
    
    # Register blueprints
    from app.routes import main_bp, camera_bp, upload_bp, admin_bp, email_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(email_bp)
    
    return app
