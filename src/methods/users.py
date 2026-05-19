from typing import Optional
# from utils.types import User, Order
from utils import user_role_type, user_spec_type, order_status_type
from database import *
from config import *

async def register_account(
    first_name: str,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
    spec: Optional[list[str]] = None
) -> dict:
    """
    Регистрирует пользователя (создание учётной записи).

    :param first_name: Имя. Если длиннее 64 символов - обрезается.
    :param last_name: Фамилия. Если длиннее 64 символов - обрезается.
    :param role: Роль пользователя в системе. Исходя из списка :data:`src.utils.utils.user_role_type`. Если :code:`None`, то выставится значение :code:`"customer"`.
    :param spec: Список специализаций пользователя. Исходя из списка :data:`src.utils.utils.user_spec_type`.
    :return: В случае успеха возвращает словарь с данными пользователя. Иначе: :code:`{"error": Текст ошибки}`.
    """
    first_name = first_name.strip()
    if not first_name:
        return {"error": "Дано пустое имя"}
    if len(first_name) > 64:
        first_name = first_name[:64]

    if last_name:
        last_name = last_name.strip()
        if not last_name:
            last_name = None
        if len(last_name) > 64:
            last_name = last_name[:64]

    if role:
        role = role.strip()
        if not role:
            return {"error": "Дана пустая роль"}
        if role not in user_role_type:
            return {"error": f"Дана неизвестная роль - {role}"}
    if role is None:
        role = "customer"

    if spec:
        old_spec = spec
        spec = []
        for s in old_spec:
            if s in user_spec_type:
                s = s.strip()
                if s:
                    spec.append(s)
                else: continue
            else: continue
        if not spec:
            spec = None

    new_user, err = await db.user_create(first_name, last_name, role, spec)
    if err:
        return {"error": err}
    return dict(vars(new_user))

async def read_account(
    user_id: int
) -> dict:
    """
    Находит учётную запись по UID.

    :param user_id: UID искомой учётной записи.
    :return: В случае успеха возвращает словарь с данными учётной записи. Иначе: :code:`{"error": Текст ошибки}`.
    """
    user, err = await db.user_read(id=user_id)
    if err:
        return {"error": err}
    return dict(vars(user))

async def update_account_bio(
    user_id: int,
    new_bio: Optional[str] = None
) -> dict:
    """
    Обновление описание профиля.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_bio: Новое описание.
    :return: В случае успеха возвращает словарь с уже обновлёнными данными пользователя. Иначе: :code:`{"error": Текст ошибки}`.
    """
    if new_bio:
        new_bio = new_bio.strip()
        if not new_bio:
            new_bio = None
        if new_bio and len(new_bio) > 384:
            new_bio = new_bio[:384]

    updated_user, err = await db.user_update(user_id, True, bio=new_bio)
    if err:
        return {"error": err}
    return dict(vars(updated_user))

async def update_account_spec(
    user_id: int,
    spec: Optional[list[str]],
    rewrite: bool = False
) -> dict:
    """
    Обновляет список специализаций пользователя.

    :param user_id: ID пользователя, чьи параметры подлежат обновлению.
    :param spec: Список с новыми параметрами. Исходя из списка :data:`src.utils.utils.user_spec_type`.
    :param rewrite: Если :code:`False`, то прибавит с текущему списку специализаций пользователя новые, данные в параметре :code:`spec`. Иначе совершить перезапись.
    :return: В случае успеха возвращает словарь с уже обновлёнными данными пользователя. Иначе: :code:`{"error": Текст ошибки}`.
    """
    if spec:
        old_spec = spec
        spec = []
        for s in old_spec:
            if s and s in user_spec_type:
                s = s.strip()
                if s:
                    spec.append(s)
                else: continue
            else: continue
        if not spec:
            spec = None

        if spec is not None:
            user, err = await db.user_read(id=user_id)
            if err:
                return {"error": err}

            if not rewrite:
                spec = user.spec + spec
            else:
                pass
            spec = set(spec)

    updated_user, err = await db.user_update(user_id, True, spec=spec)
    if err:
        return {"error": err}
    return dict(vars(updated_user))

async def delete_account(
    user_id: int,
) -> dict:
    """
    Удаляет учётную запись.

    :param user_id: UID удаляемой учётной записи.
    :return: В случае успеха возвращает словарь :code:`{"result": True/False}`. Иначе: :code:`{"error": Текст ошибки}`.
    """
    result, err = await db.user_delete(user_id)
    if err:
        return {"error": err}
    return {"result": result}