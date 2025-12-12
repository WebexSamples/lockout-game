# backend/app.py
from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from .config import Config
from .routes.lobby import lobby_bp
from .routes.game import game_bp  # Import our new game blueprint
from .sockets.lobby import register_lobby_socket_handlers  # Import our lobby socket handlers
from .sockets.game import register_game_socket_handlers  # Import our game socket handlers

app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS with allowed origins from config
CORS(app, origins=app.config.get('ALLOWED_ORIGINS', '*'))

socketio = SocketIO(app, cors_allowed_origins=app.config.get('ALLOWED_ORIGINS', '*'), async_mode='eventlet')

# Health check endpoint for ALB
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for load balancer"""
    return jsonify({
        'status': 'healthy',
        'service': 'lockout-game'
    }), 200

# Register REST API routes
app.register_blueprint(lobby_bp, url_prefix='/api')
app.register_blueprint(game_bp, url_prefix='/api')  # Register game routes

# Register socket handlers
register_lobby_socket_handlers(socketio)
register_game_socket_handlers(socketio)  # Register our new game socket handlers

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
