import json
from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "default"):
        await websocket.accept()
        if channel not in self._active:
            self._active[channel] = set()
        self._active[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str = "default"):
        if channel in self._active:
            self._active[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel not in self._active:
            return
        dead = []
        for ws in self._active[channel]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._active[channel].discard(ws)
