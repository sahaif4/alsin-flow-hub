from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # A dictionary to hold active connections: {user_id: WebSocket}
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        """Accept a new connection and add it to the dictionary."""
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        """Remove a connection from the dictionary."""
        if user_id in self.active_connections:
            # Note: The websocket object itself should be closed in the endpoint.
            # This method just removes the reference from the manager.
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Send a JSON message to a specific user if they are connected."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

    async def broadcast(self, message: str):
        """Send a text message to all connected clients."""
        for connection in self.active_connections.values():
            await connection.send_text(message)

# Create a single instance of the manager to be used across the application
manager = ConnectionManager()
