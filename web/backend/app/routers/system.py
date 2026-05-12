import asyncio
from fastapi import APIRouter, Depends
from app.deps import get_data_service
from app.models.common import ApiResponse

router = APIRouter()


@router.get("/status")
async def system_status(ds=Depends(get_data_service)):
    result = await asyncio.to_thread(ds.get_system_status)
    return ApiResponse(data=result)


@router.get("/version")
async def version():
    return ApiResponse(data={"version": "0.1.0", "name": "InfoLens"})


@router.get("/doctor")
async def doctor(ds=Depends(get_data_service)):
    status = await asyncio.to_thread(ds.get_system_status)
    return ApiResponse(data={
        "health": status.get("health", "unknown"),
        "version": status.get("system", {}).get("version", "unknown"),
        "data_status": status.get("data", {}),
    })
