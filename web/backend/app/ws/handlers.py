from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws.manager import ConnectionManager

router = APIRouter()


def create_ws_router(ws_manager: ConnectionManager) -> APIRouter:
    ws_router = APIRouter()

    @ws_router.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        channel = websocket.query_params.get("channel", "tasks")
        await ws_manager.connect(websocket, channel)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket, channel)

    return ws_router
