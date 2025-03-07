# backend/app.py
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from .config import Config
from .routes.lobby import lobby_bp
from .sockets.lobby import register_lobby_socket_handlers  # Import our lobby socket handlers

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register REST API routes
app.register_blueprint(lobby_bp, url_prefix='/api')

# Register lobby-specific socket handlers
register_lobby_socket_handlers(socketio)

if __name__ == '__main__':
    socketio.run(app, debug=True)
