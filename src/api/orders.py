from fastapi import APIRouter, HTTPException, Header, UploadFile, File

from pydantic import BaseModel, Field
from typing import Optional

import shutil
import os

from config import *
from utils import user_role_type, user_role
from utils.types import User
import methods
from .users import UserLogin

router = APIRouter()

class OrderCreate(BaseModel):
    title: str      = Field(..., max_length=TITLE_MAX_LEN)
    techspec: str   = Field(..., min_length=TECHSPEC_MIN_LEN)


@router.post("/orders/create")
async def order_create(
    customer: UserLogin,
    new_order: OrderCreate
) -> dict:
    """
    Создать заказ.

    :param customer: Данные человека, на чью учётную запись создаётся заказ. В формате :class:`.users.UserLogin`.
    :param new_order: Данные создаваемого заказа. В формате :class:`OrderCreate`.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные созданного заказа.
    """
    user = await methods.login_account(
        customer.email,
        customer.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    user = User(**user)

    order = await methods.create_order(
        new_order.title,
        new_order.techspec,
        user.id
    )
    if "error" in order:
        raise HTTPException(403, order['error'])

    user, err = await db.user_update(
        user.id,
        orders_created=user.orders_created + [order['id']]
    )
    if err:
        return {"error": [err]}

    return order

@router.get("/orders/read/{order_id}")
async def order_read(
    order_id: int
) -> dict:
    """
    Получить данные заказа.

    :param order_id: ID искомого заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные найденного заказа.
    """
    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])
    return order

#
# TODO Создать функцию поиска заказов по title и status (order_search)
#

@router.post("/orders/update/title")
async def order_update_title(
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_title: str = Header(..., alias="new_title")
) -> dict:
    """
    Обновить назкание заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_title: Новое название заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
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
    if user['id'] != order['customer_id'] or user['role'] not in user_role_type[-1]:
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
    Обновить техническое задание заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_techspec: Новое техническое задание заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
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
    if user['id'] != order['customer_id'] or user['role'] not in user_role_type[-1]:
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
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    file: Optional[UploadFile] = File(None)
) -> dict:
    """
    Обновить превью (обложку) заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param file: Новая обложкка заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    os.makedirs("src/site/public/previews", exist_ok=True)          # Хардкод
    file_path = f"src/site/public/previews/order_{order_id}.jpg"    # Хардкод
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/previews/order_{order_id}.jpg"

    order, err = await db.order_update(
        order_id,
        preview_url=url
    )
    if err:
        return {"error": [err]}
    return dict(vars(order))

@router.post("/orders/update/status")
async def order_update_status(
    request: UserLogin,
    order_id: int = Header(..., alias="order_id"),
    new_status: str = Header(..., alias="new_status")
) -> dict:
    """
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_status: Новая статус заказа. В формате :data:`..utils.utils.order_status_type`.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
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
    if user['id'] != order['manager_id'] or user['role'] not in user_role_type[-1]:
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
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_manager_id: UID нового менеджера заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
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
    if user['role'] not in user_role_type[-1]:
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
    new_students_pinned: list[int] = Header(None, alias="new_students_pinned")
) -> dict:
    """
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_students_pinned: Новый список (:code:`list`) с UIDs прикреплённых исполнителей (студентов) к заказу. Перезаписывает существующий список!
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
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
    if user['id'] != order['manager_id'] or user['role'] not in user_role_type[-1]:
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
    Удаляет заказ из БД полностью.

    :param order_id: ID изменяемого заказа.
    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :return: В случае успеха возвращает словарь :code:`{"result": True/False}`. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    user = await methods.login_account(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    user = User(**user)
    if user.role != user_role_type[-1]:
        raise HTTPException(403, f"Только {user_role['admin']} может удалить заказ")

    order = await methods.read_order(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user, err = await db.user_update(
        user.id,
        orders_created=user.orders_created - [order['id']]
    )
    if err:
        return {"error": [err]}

    result = await methods.delete_order(order_id)
    if "error" in result:
        raise HTTPException(403, result['err'])
    return result