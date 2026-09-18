
from __future__ import annotations
from typing import Optional
from shutil import copyfileobj

from fastapi import APIRouter, HTTPException, Header, UploadFile, File

from config import SITE_PUBLIC_DIR
from models import UserRegister, UserLogin, UserSearch
import methods
from singleton import get_db


router = APIRouter()


@router.post("/users/register")
async def user_register(
    request: UserRegister
) -> dict:
    """
    Зарегистрировать учётную запись.  
    Принимает в :code:`Header` :class:`UserRegister`.
    """
    user = await methods.users.register(
        request.email,
        request.password,
        request.first_name,
        request.last_name,
        request.role,
        request.spec
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.post("/users/login")
async def user_login(
    request: UserLogin
) -> dict:
    """
    Войти в учётную запись.  
    Принимает в :code:`Header` :class:`UserLogin`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.get("/users/read/{user_id}")
async def user_read(
    user_id: int
) -> dict:
    """
    Получить данные учётной записи.
    """
    user = await methods.users.read(user_id)
    if "error" in user:
        raise HTTPException(403, user['error'])
    return user

@router.post("/users/search")
async def user_search(
    request: UserSearch
) -> dict:
    """
    Найти учётные записи по данным параметрам.  
    Принимает в :code:`Header` :class:`UserSearch`.
    """
    users = await methods.users.search(
        request.email,
        request.first_name,
        request.last_name,
        request.bio,
        request.role,
        request.spec
    )
    if "error" in users:
        raise HTTPException(403, users['error'])
    return users

@router.post("/users/update/email")
async def user_update_email(
    request: UserLogin,
    new_email: str = Header(..., alias="new_email")
) -> dict:
    """
    Обновить электронную почту данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_email: str`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.change_email(
        user['id'],
        new_email
    )
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

@router.post("/users/update/password")
async def user_update_password(
    request: UserLogin,
    new_password: str = Header(..., alias="new_password")
) -> dict:
    """
    Обновить пароль данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_password: str` (данный пароль должен быть в незашифрованном виде).
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.change_password(
        user['id'],
        new_password
    )
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

@router.post("/users/update/names")
async def user_update_names(
    request: UserLogin,
    new_first_name: Optional[str] = Header(None, alias="new_first_name"),
    new_last_name: Optional[str] = Header(None, alias="new_last_name")
) -> dict:
    """
    Обновить имя, фамилию данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin`, :code:`new_first_name: str` и :code:`new_last_name: str`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.change_names(
        user['id'],
        new_first_name,
        new_last_name
    )
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

@router.post("/users/update/bio")
async def user_update_bio(
    request: UserLogin,
    new_bio: Optional[str] = Header(None, alias="new_bio")
) -> dict:
    """
    Обновить поле "О себе" данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_bio: str`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.change_bio(
        user['id'],
        new_bio
    )
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

@router.post("/users/update/avatar")
async def user_update_avatar(
    user_id: int = Header(..., alias="user_id"),
    file: Optional[UploadFile] = File(...)
):
    db = get_db()
    avatars_dir = SITE_PUBLIC_DIR / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)
    file_path = avatars_dir / f"user_{user_id}.jpg"
    with open(file_path, "wb") as buffer:
        copyfileobj(file.file, buffer)
    url = f"/avatars/user_{user_id}.jpg"

    user, err = await db.users.update(
        user_id,
        avatar_url=url
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

@router.post("/users/update/spec")
async def user_update_spec(
    request: UserLogin,
    new_spec: Optional[list[str]] = Header(None, alias="new_spec")
) -> dict:
    """
    Обновить специальности данной учётной записи.  
    Принимает в :code:`Header` :class:`UserLogin` и :code:`new_spec: list[str]`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.change_spec(
        user['id'],
        new_spec,
        True
    )
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

@router.delete("/users/delete")
async def user_delete(
    request: UserLogin
) -> dict:
    """
    Удаляет учётную запись.  
    Принимает в :code:`Header` :class:`UserLogin`.
    """
    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.users.delete(user['id'])
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result