from __future__ import annotations
from typing import Optional
from shutil import copyfileobj

from fastapi import APIRouter, HTTPException, Header, UploadFile, File

from config import (
    SITE_PUBLIC_DIR,
    user_role_tuple, user_role_text
)
from models import User, UserLogin, OrderCreate
import methods
from singleton import get_db


router = APIRouter()


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
    db = get_db()

    user = await methods.users.login(
        customer.email,
        customer.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    user = User(**user)

    order = await methods.orders.create(
        new_order.title,
        new_order.techspec,
        user.id
    )
    if "error" in order:
        raise HTTPException(403, order['error'])

    user, err = await db.users.update(
        user.id,
        orders_created=user.orders_created + [order['id']]
    )
    if err:
        return {"error": [err]}

    return order

@router.get("/orders/read/{order-id}")
async def order_read(
    order_id: int
) -> dict:
    """
    Получить данные заказа.

    :param order_id: ID искомого заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные найденного заказа.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])
    return order

#
# TODO Создать функцию поиска заказов по title и status (order_search)
#

@router.post("/orders/update/title")
async def order_update_title(
    request: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    new_title: str = Header(..., alias="new-title")
) -> dict:
    """
    Обновить назкание заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_title: Новое название заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['customer_id'] or user['role'] not in user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['customer']} и {user_role_text['admin']} могут переименовать заказ")

    updated_order = await methods.orders.change_title(
        order_id,
        new_title
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/techspec")
async def order_update_techspec(
    request: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    new_techspec: str = Header(..., alias="new-techspec")
) -> dict:
    """
    Обновить техническое задание заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_techspec: Новое техническое задание заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['customer_id'] or user['role'] not in user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['customer']} и {user_role_text['admin']} могут изменить ТЗ заказа")

    updated_order = await methods.orders.change_techspec(
        order_id,
        new_techspec
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/preview")
async def order_update_preview(
    request: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    file: Optional[UploadFile] = File(None)
) -> dict:
    """
    Обновить превью (обложку) заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param file: Новая обложкка заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    db = get_db()

    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])

    previews_dir = SITE_PUBLIC_DIR / "previews"
    previews_dir.mkdir(parents=True, exist_ok=True)
    file_path = previews_dir / f"order_{order_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        copyfileobj(file.file, buffer)
        
    url = f"/previews/order_{order_id}.jpg"

    order, err = await db.orders.update(
        order_id,
        preview_url=url
    )
    if err:
        return {"error": [err]}
    return dict(vars(order))

@router.post("/orders/update/status")
async def order_update_status(
    request: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    new_status: str = Header(..., alias="new-status")
) -> dict:
    """
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_status: Новая статус заказа. В формате :data:`..utils.utils.order_status_type`.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['manager_id'] or user['role'] not in user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['manager']} и {user_role_text['admin']} могут изменить статус заказа")

    updated_order = await methods.orders.change_status(
        order_id,
        new_status
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/manager")
async def order_update_manager(
    admin: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    new_manager_id: str = Header(..., alias="new-manager-id")
) -> dict:
    """
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_manager_id: UID нового менеджера заказа.
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.users.login(
        admin.email,
        admin.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['role'] not in user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['admin']} может изменить {user_role_text['manager']}а заказа")

    updated_order = await methods.orders.change_manager(
        order_id,
        new_manager_id
    )
    if "error" in updated_order:
        raise HTTPException(403, updated_order['error'])
    return updated_order

@router.post("/orders/update/students")
async def order_update_students(
    admin: UserLogin,
    order_id: int = Header(..., alias="order-id"),
    new_students_pinned: list[int] = Header(None, alias="new-students-pinned")
) -> dict:
    """
    Обновить статус заказа.

    :param request: Данные человека, кому принадлежит заказ. В формате :class:`.users.UserLogin`.
    :param order_id: ID изменяемого заказа.
    :param new_students_pinned: Новый список (:code:`list`) с UIDs прикреплённых исполнителей (студентов) к заказу. Перезаписывает существующий список!
    :return: В случае неуспеха вернёт ошибку 403. Иначе - данные заказа, с обновлёнными данными.
    """
    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user = await methods.users.login(
        admin.email,
        admin.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    if user['id'] != order['manager_id'] or user['role'] not in user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['manager']} и {user_role_text['admin']} может список исполнителей, закреплённых за заказом")

    updated_order = await methods.orders.change_students(
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
    db = get_db()

    user = await methods.users.login(
        request.email,
        request.password
    )
    if "error" in user:
        raise HTTPException(403, user['error'])
    user = User(**user)
    if user.role != user_role_tuple[-1]:
        raise HTTPException(403, f"Только {user_role_text['admin']} может удалить заказ")

    order = await methods.orders.read(order_id)
    if "error" in order:
        raise HTTPException(403, order['error'])

    user, err = await db.users.update(
        user.id,
        orders_created=user.orders_created - [order['id']]
    )
    if err:
        return {"error": [err]}

    result = await methods.orders.delete(order_id)
    if "error" in result:
        raise HTTPException(403, result['err'])
    return result