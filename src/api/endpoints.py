from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from config import *
from utils.types import *
import methods

router = APIRouter()


class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str             = Field(..., max_length=FIRST_NAME_MAX_LEN)
    last_name: Optional[str]    = Field(..., max_length=LAST_NAME_MAX_LEN)
    role: Optional[str]         = ROLE_DEFAULT
    spec: Optional[list[str]]   = None

class UserLogin(BaseModel):
    email: str
    password: str               = Field(..., min_length=PASSWORD_MIN_LEN)

class UserSearch(BaseModel):
    email: Optional[str]        = None
    first_name: Optional[str]   = Field(..., max_length=FIRST_NAME_MAX_LEN)
    last_name: Optional[str]    = Field(..., max_length=LAST_NAME_MAX_LEN)
    bio: Optional[str]          = Field(..., max_length=BIO_MAX_LEN)
    role: Optional[str]         = None
    spec: Optional[list[str]]   = None


@router.get("/")
async def ping_api():
    return {
        "status": True,
        "timestamp": datetime.now()
    }

@router.post("/api/users/register")
async def user_register(
    request: UserRegister
) -> dict:
    """
    Зарегистрировать учётную запись.  
    Принимает в :code:`Header` :class:`UserRegister`.
    """
    user = await methods.register_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.post("/api/users/login")
async def user_login(
    request: UserLogin
) -> dict:
    """
    Войти в учётную запись.  
    Принимает в :code:`Header` :class:`UserLogin`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.get("/api/users/read/{user_id}")
async def user_read(
    user_id: int
) -> dict:
    """
    Получить данные учётной записи.
    """
    user = await methods.read_account(user_id)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.post("/api/users/search")
async def user_search(
    request: UserSearch
) -> dict:
    """
    Найти учётные записи по данным параметрам.  
    Принимает в :code:`Header` :class:`UserSearch`.
    """
    users = await methods.search_accounts(**request)
    if "error" in users:
        raise HTTPException(403, users['error'])
    return users

@router.post("/api/users/update/email")
async def user_update_email(
    request: UserLogin,
    new_email: str = Header(..., alias="new_email")
) -> dict:
    """
    Обновить электронную почту данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_email: str`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.update_account_email(user['id'], new_email)
    if "error" in result:
        raise HTTPException(403, user['error'])
    return result

@router.post("/api/users/update/password")
async def user_update_password(
    request: UserLogin,
    new_password: str = Header(..., alias="new_password")
) -> dict:
    """
    Обновить пароль данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_password: str` (данный пароль должен быть в незашифрованном виде).
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.update_account_password(user['id'], new_password)
    if "error" in result:
        raise HTTPException(403, user['error'])
    return result

@router.post("/api/users/update/names")
async def user_update_names(
    request: UserLogin,
    new_first_name: str = Optional[Header(..., alias="new_fist_name")],
    new_last_name: str = Optional[Header(..., alias="new_last_name")]
) -> dict:
    """
    Обновить имя, фамилию данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin`, :code:`new_first_name: str` и :code:`new_last_name: str`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.update_account_names(user['id'], new_first_name, new_last_name)
    if "error" in result:
        raise HTTPException(403, user['error'])
    return result

@router.post("/api/users/update/bio")
async def user_update_bio(
    request: UserLogin,
    new_bio: str = Header(..., alias="new_bio")
) -> dict:
    """
    Обновить поле "О себе" данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_bio: str`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.update_account_bio(user['id'], new_bio)
    if "error" in result:
        raise HTTPException(403, user['error'])
    return result

@router.post("/api/users/update/spec")
async def user_update_spec(
    request: UserLogin,
    new_spec: list[str] = Header(..., alias="new_spec")
) -> dict:
    """
    Обновить специальности данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_spec: list[str]`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.update_account_spec(user['id'], new_spec, True)
    if "error" in result:
        raise HTTPException(403, user['error'])
    return result

@router.delete("/api/users/delete")
async def user_delete(
    request: UserLogin
) -> dict:
    """
    Удаляет учётную запись.  
    Принимает в :code:`Header` :class:`UserLogin`.
    """
    user = await methods.login_account(**request)
    if "error" in user:
        raise HTTPException(403, user['error'])
    result = await methods.delete_account(user['id'])
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result