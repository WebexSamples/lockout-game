# Multi-User Webex Embedded App Launch Pad

![Launch Pad Image](image.png)

A Webex Embedded App starter project providing a **real-time multi-user lobby system** for seamless collaboration within Webex Meetings. This project uses a **Flask backend** with **Flask-SocketIO** for real-time communication and a **React frontend** powered by **Vite**. Users can create, join, and manage lobbies dynamically with WebSocket-based updates. The project is built to be integrated with Webex Embedded Apps to provide a seamless real-time experience within Webex Meetings.

## Features

| Feature                            | Description                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| **Lobby Creation**                 | Users can create a lobby with a custom name.                  |
| **Join & Leave**                   | Participants can enter or exit lobbies in real-time.          |
| **Unique IDs**                     | Each user receives a unique UUID for tracking.                |
| **Display Name Updates**           | Users can modify their display names.                         |
| **Ready Toggle**                   | Participants can mark themselves as "Ready" or "Not Ready."   |
| **Real-Time Updates**              | Instant lobby state updates with **Socket.IO**.               |
| **Webex Embedded App Integration** | Fetches meeting details and integrates seamlessly into Webex. |

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm

### Backend Setup

```sh
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### Frontend Setup

```sh
cd frontend
npm install
```

## Running the Project

### Start the Backend

```sh
python -m backend.app
```

This starts the Flask server with Socket.IO on port **5000**.

### Start the Frontend

```sh
npm run dev
```

The Vite development server usually runs at **http://localhost:5173**.

## API Endpoints

### Create a Lobby

**POST** `/api/lobby`

```json
{
  "host_id": "user123",
  "host_display_name": "Alice",
  "lobby_name": "Team Discussion"
}
```

_Response:_

```json
{
  "lobby_id": "abcd-1234",
  "lobby_url": "http://localhost:5173/lobby/abcd-1234",
  "lobby_name": "Team Discussion"
}
```

### Get Lobby Details

**GET** `/api/lobby/{lobby_id}`

_Response:_

```json
{
  "host": "user123",
  "lobby_name": "Team Discussion",
  "participants": [{ "id": "user123", "display_name": "Alice", "ready": false }]
}
```

## Webex Integration

This project leverages the **Webex Embedded Apps SDK** to enhance the experience inside Webex Meetings.

### How It Works

- **Meeting Details:** The app automatically retrieves the **Webex meeting title** and sets it as the **lobby name**.
- **User Identity:** The app fetches the current user's **display name** from Webex.
- **Deep Linking:** Webex users can share the lobby link **within the Webex meeting interface**.

_For Webex SDK documentation, see:_ [Webex Embedded Apps Documentation](https://developer.webex.com/docs/embedded-apps).

## Development & Contribution

### Code Formatting

This project enforces consistent coding style using:

- **Prettier** for JavaScript (`npm run format`)
- **Ruff** for Python (`ruff check --fix .`)

### Git Workflow

- Fork & clone the repo
- Create a feature branch (`git checkout -b feature-xyz`)
- Submit a **Pull Request**

## Deployment Guide

To serve the app in a **production-like** setup:

### **Nginx Reverse Proxy Setup**

1. **Update your hosts file** (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1 lobby.local
```

2. **Generate SSL certificates** (e.g., with mkcert or Let's Encrypt).
3. **Deploy frontend**:

```sh
cd frontend
npm run build
```

4. **Run Flask backend & Nginx**.

_See the `SERVING.md` file for more details on production setup._

## Acknowledgments

Built by the **Webex Developer Relations Team** at Cisco ❤️
