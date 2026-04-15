from flask import Flask
from flask_login import LoginManager
from config import *
from utils.user_manager import user_manager

# Initialize extensions
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return user_manager.get_user(user_id)

def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object('config')

    # Initialize extensions
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    # Register blueprints
    from app.routes import main_bp, camera_bp, upload_bp, admin_bp, email_bp, auth_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(email_bp)
    app.register_blueprint(auth_bp)

    return app
