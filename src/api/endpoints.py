from fastapi import APIRouter, HTTPException, Header, UploadFile, File

from pydantic import BaseModel, Field
from typing import Optional

import shutil
import os
from datetime import datetime

from config import *
from utils import user_role_type, user_role
from utils.types import *
import methods

router = APIRouter()


@router.get("/")
async def api_ping():
    return {
        "status": True,
        "timestamp": datetime.now()
    }

#####################
#   Пользователи    #
#####################

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


@router.post("/users/register")
async def user_register(
    request: UserRegister
) -> dict:
    """
    Зарегистрировать учётную запись.  
    Принимает в :code:`Header` :class:`UserRegister`.
    """
    user = await methods.register_account(
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
    user = await methods.login_account(
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
    user = await methods.read_account(user_id)
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
    users = await methods.search_accounts(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.update_account_email(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.update_account_password(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.update_account_names(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.update_account_bio(
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
    os.makedirs("src/site/public/avatars", exist_ok=True)
    file_path = f"src/site/public/avatars/user_{user_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/avatars/user_{user_id}.jpg"

    user, err = await db.user_update(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.update_account_spec(
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
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    result = await methods.delete_account(user['id'])
    if "error" in result:
        raise HTTPException(403, result['error'])
    return result

#############
#   Заказы  #
#############

class OrderCreate(BaseModel):
    title: str
    techspec: str
    #customer_id: int


@router.post("/orders/create")
async def order_create(
    customer: UserLogin,
    created_order: OrderCreate
) -> dict:
    """
    
    """
    user = await methods.login_account(
        customer.email,
        customer.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    order = await methods.create_order(
        created_order.title,
        created_order.techspec,
        user['id']
    )
    if "error" in order:
        raise HTTPException(403, order['error'])
    return order

@router.get("/orders/read/{order_id}")
async def order_read(
    order_id: int
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])
    return order

@router.post("/orders/update/title")
async def order_update_title(
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_title: str = Header(..., alias="new_title")
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['customer_id'] or user['status'] not in user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['customer']} и {user_role['admin']} могут переименовать заказ")

    updated_order = await methods.update_order_title(
        order_id,
        new_title
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/techspec")
async def order_update_techspec(
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_techspec: str = Header(..., alias="new_techspec")
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['customer_id'] or user['status'] not in user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['customer']} и {user_role['admin']} могут изменить ТЗ заказа")

    updated_order = await methods.update_order_techspec(
        order_id,
        new_techspec
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/preview")
async def order_update_preview(
    order_id: int = Header(..., alias="order_id"),
    file: Optional[UploadFile] = File(...)
):
    os.makedirs("src/site/public/previews", exist_ok=True)
    file_path = f"src/site/public/previews/order_{order_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/previews/order_{order_id}.jpg"

    user, err = await db.user_update(
        order_id,
        preview_url=url
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

@router.post("/orders/update/status")
async def order_update_status(
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_status: str = Header(..., alias="new_status")
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['manager_id'] or user['status'] not in user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['manager']} и {user_role['admin']} могут изменить статус заказа")

    updated_order = await methods.update_order_status(
        order_id,
        new_status
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/manager")
async def order_update_manager(
    admin: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_manager_id: str = Header(..., alias="new_manager_id")
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        admin.email,
        admin.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['status'] not in user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['admin']} может изменить {user_role['manager']}а заказа")

    updated_order = await methods.update_order_manager(
        order_id,
        new_manager_id
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/students")
async def order_update_students(
    admin: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_students_pinned: list[int] = Header(..., alias="new_students_pinned")
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        admin.email,
        admin.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['manager_id'] or user['status'] not in user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['manager']} и {user_role['admin']} может список исполнителей, закреплённых за заказом")

    updated_order = await methods.update_order_students(
        order_id,
        new_students_pinned
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.delete("/orders/delete/{order_id}")
async def order_delete(
    order_id: int,
    request: UserLogin
) -> dict:
    """
    
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['status'] != user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['admin']} может удалить заказ")

    result = await methods.delete_order(order_id)
    if "error" in result:
        raise HTTPException(403, result['err'])
    return result