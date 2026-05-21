from fastapi import APIRouter, HTTPException#, Header
from pydantic import BaseModel#, Field
from typing import Optional
from datetime import datetime

from config import *
from utils.types import *
import methods

router = APIRouter()


class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: Optional[str] = None
    role: Optional[str] = None
    spec: Optional[list[str]] = None

class UserLogin(BaseModel):
    email: str
    password: str


@router.get("/")
async def ping_api():
    return {"status": True, "timestamp": datetime.now().timestamp()}

@router.post("/users/register")
async def user_register(request: UserRegister):
    user = await methods.register_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.get("/users/login")
async def user_login(request: UserLogin):
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.get("/users/read/{user_id}")
async def user_read(user_id: int):
    user = await methods.read_account(user_id)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user