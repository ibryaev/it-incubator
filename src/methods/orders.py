from typing import Optional
from utils import order_status_type
from database import *
from config import *

async def create_order(
    title: str,
    techspec: str,
    customer_id: int
) -> dict:
    """
    
    """
    errors = []

    title = title.strip()
    if not title:
        errors.append("Пустое название проекта")
    if len(title) > TITLE_MAX_LEN:
        errors.append("Слишком длинное название проетка")

    techspec = techspec.strip()
    if not techspec:
        errors.append("Пустое техническое задание")
    if len(techspec) < TECHSPEC_MIN_LEN:
        errors.append("Слишком короткое техническое задание")

    new_order, err = await db.order_create(
        title,
        techspec,
        customer_id
    )
    if err:
        return {"error": [err]}
    return dict(vars(new_order))

async def read_order(
    order_id: int
) -> dict:
    """
    
    """
    order, err = await db.order_read(id=order_id)
    if err:
        return {"error": [err]}
    return dict(vars(order))

# async def search_orders()

async def update_order_title(
    order_id: int,
    new_title: str
) -> dict:
    """
    
    """
    new_title = new_title.strip()
    if not new_title:
        return {"error": ["Пустое название"]}
    if len(new_title) > TITLE_MAX_LEN:
        return {"error": ["Слишком длинное название"]}

    updated_order, err = await db.order_update(
        order_id,
         title=new_title
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def update_order_techspec(
    order_id: int,
    new_techspec: str
) -> dict:
    """
    
    """
    new_techspec = new_techspec.strip()
    if not new_techspec:
        return {"error": ["Пустое техническое задание"]}
    if len(new_techspec) < TECHSPEC_MIN_LEN:
        return {"error": ["Слишком короткое техническое задание"]}

    updated_order, err = await db.order_update(
        order_id,
        techspec=new_techspec
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def update_order_status(
    order_id: int,
    new_status: str
) -> dict:
    """
    
    """
    new_status = new_status.strip()
    if not new_status:
        return {"error": ["Пустой статус"]}
    if new_status not in order_status_type:
        return {"error": [f"Неизвестный статус - {new_status}"]}

    updated_order, err = await db.order_update(
        order_id,
        status=new_status
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def update_order_manager(
    order_id: int,
    new_manager_id: int
) -> dict:
    """
    
    """
    _, err = await db.user_read(id=new_manager_id)
    if err:
        return {"error": [err]}

    updated_order, err = await db.order_update(
        order_id,
        manager_id=new_manager_id
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def update_order_students(
    order_id: int,
    new_students_pinned: Optional[list[int]]
) -> dict:
    """
    
    """
    for student_id in new_students_pinned:
        _, err = await db.user_read(id=student_id)
        if err:
            return {"error": [f"Ошибка при поиске студента UID-{student_id} - {err}"]}

    updated_order, err = await db.order_update(
        order_id,
        students_pinned=new_students_pinned
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def delete_order(
    order_id: int
) -> dict:
    """
    
    """
    result, err = await db.order_delete(order_id)
    if err:
        return {"error": [err]}
    return {"result": result}