from typing import Optional
# from utils.types import User, Order
from utils import user_role_type, user_spec_type, order_status_type
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
        errors.append("Дано пустое название проекта")
    if len(title) > TITLE_MAX_LEN:
        errors.append("Слишком длинное название проетка")

    techspec = techspec.strip()
    if not techspec:
        errors.append("Дано пустое техническое задание")
    if len(techspec) < TECHSPEC_MIN_LEN:
        errors.append("Слишком короткое техническое задание")

    new_order, err = await db.order_create(
        title,
        techspec, customer_id
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

async def close_order(
    order_id: int
) -> dict:
    """
    
    """
    result, err = await db.order_delete(order_id)
    if err:
        return {"error": [err]}
    return {"result": result}