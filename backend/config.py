import os
from dotenv import load_dotenv

# Load environment variables from a .env file in the project root
load_dotenv()

class Config:
    # Environment
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # URLs and Origins
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')  # Default for local dev
    
    # Configure allowed origins based on environment
    if FLASK_ENV == 'production':
        # In production, use specific allowed origins
        ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', FRONTEND_URL).split(',')
    else:
        # In development, allow all origins for easier testing
        ALLOWED_ORIGINS = '*'
    
    # Server configuration
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
