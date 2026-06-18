"""
AI Attendance System - Main Application Entry Point
"""
import os
import sys

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)
# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app

# Create Flask application
app = create_app()

if __name__ == '__main__':
    # Get port from environment (Render injects PORT)
    port = int(os.environ.get('PORT', 5001))
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true',
        threaded=True
    )
