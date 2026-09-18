from __future__ import annotations
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from typedefs import OrderDict, ErrorsDict, BoolResultDict, ErrorString, OrderId, UserId

from utils import check_title, check_techspec, check_status
from singleton import get_db


#   Create  #

async def create(
    title: str,
    techspec: str,
    customer_id: UserId
) -> OrderDict | ErrorsDict:
    """
    Создать (разместить) заказ.

    :param title: Название проекта.
    :param techspec: Описание (техническое задание).
    :param customer_id: UID учётной записи, которая создала заказ.
    :return OrderDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_title`, :func:`..utils.check_techspec`.
    """
    db = get_db()
    errors: list[ErrorString] = []

    title = title.strip()
    res = check_title(title)
    if res: errors.append(res)

    techspec = techspec.strip()
    res = check_techspec(techspec)
    if res: errors.append(res)

    new_order, err = await db.orders.create(
        title,
        techspec,
        customer_id
    )
    if err:
        return {"error": [err]}
    return dict(vars(new_order))

#   Read    #

async def read(
    order_id: OrderId
) -> OrderDict | ErrorsDict:
    """
    Находит заказ запись по OID.

    :param order_id: OID искомого заказа.
    :return OrderDict: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    order, err = await db.orders.read(id=order_id)
    if err:
        return {"error": [err]}
    return dict(vars(order))

# async def search(
#     ...
# ) -> list[OrderDict] | ErrorsDict:
#     ...

#   Update  #

async def change_title(
    order_id: OrderId,
    new_title: str
) -> OrderDict | ErrorsDict:
    """
    Обновление названия проекта (заказа).

    :param order_id: OID заказа, чьи параметры подлежат обновлению.
    :param new_title: Новое название.
    :return OrderDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_title`.
    """
    db = get_db()

    new_title = new_title.strip()
    res = check_title(new_title)
    if res: return {'error': [res]}

    updated_order, err = await db.orders.update(
        order_id,
        title=new_title
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def change_techspec(
    order_id: OrderId,
    new_techspec: str
) -> OrderDict | ErrorsDict:
    """
    Обновление технического задания.

    :param order_id: OID заказа, чьи параметры подлежат обновлению.
    :param new_techspec: Новое техническое задание (описание).
    :return OrderDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_techspec`.
    """
    db = get_db()

    new_techspec = new_techspec.strip()
    res = check_techspec(new_techspec)
    if res: return {'error': [res]}

    updated_order, err = await db.orders.update(
        order_id,
        techspec=new_techspec
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def change_status(
    order_id: OrderId,
    new_status: str
) -> OrderDict | ErrorsDict:
    """
    Обновление статуса заказа.

    :param order_id: OID заказа, чьи параметры подлежат обновлению.
    :param new_status: Новый статус заказа. Исходя из :data:`..typedefs.order_status.OrderStatus`.
    :return OrderDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_status`.
    """
    db = get_db()

    new_status = new_status.strip()
    res = check_status(new_status)
    if res: return {'error': [res]}

    updated_order, err = await db.orders.update(
        order_id,
        status=new_status
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def change_manager(
    order_id: OrderId,
    new_manager_id: UserId
) -> OrderDict | ErrorsDict:
    """
    Обновление менеджера, закреплённого за заказом.

    :param order_id: OID заказа, чьи параметры подлежат обновлению.
    :param new_manager_id: UID нового менеджера.
    :return OrderDict: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    _, err = await db.users.read(id=new_manager_id)
    if err:
        return {"error": [err]}

    updated_order, err = await db.orders.update(
        order_id,
        manager_id=new_manager_id
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def change_students(
    order_id: OrderId,
    new_students_pinned: Optional[list[int]],
    rewrite: bool = False
) -> OrderDict | ErrorsDict:
    """
    Обновляет список студентов, закреплённых за заказом.

    :param order_id: UID заказа, чьи параметры подлежат обновлению.
    :param new_students_pinned: Список с новыми UID студентов.
    :param rewrite: Если :code:`False`, то прибавит с текущему списку закреплённых студентов пользователя новые, данные в параметре :code:`new_students_pinned`. Иначе совершит перезапись.
    :return OrderDict: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    for student_id in new_students_pinned:
        _, err = await db.users.read(id=student_id)
        if err:
            return {"error": [f"Ошибка при поиске студента UID-{student_id} - {err}"]}

    order, err = await db.orders.read(id=order_id)
    if err:
        return {'error': [f'Ошибка при чтении заказа OID-{order_id} - {err}']}
    if not rewrite and order.students_pinned:
        new_students_pinned = new_students_pinned + order.students_pinned
    new_students_pinned = list(set(new_students_pinned))

    updated_order, err = await db.orders.update(
        order_id,
        students_pinned=new_students_pinned
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_order))

async def delete(
    order_id: OrderId
) -> BoolResultDict | ErrorsDict:
    """
    Удаление заказа.

    :param order_id: UID удаляемой учётной записи.
    :return BoolResultDict: Результат изменений.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    result, err = await db.orders.delete(order_id)
    if err:
        return {"error": [err]}
    return {"result": result}
