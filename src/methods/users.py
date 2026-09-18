from __future__ import annotations
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from typedefs import UserDict, ErrorsDict, BoolResultDict, ErrorString, UserId

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from utils import check_email, check_password, check_name, check_bio, check_role, check_spec
from singleton import get_db


ph: PasswordHasher = PasswordHasher()


#   Create  #

async def register(
    email: str,
    password: str,
    first_name: str,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
    spec: Optional[list[str]] = None
) -> UserDict | ErrorsDict:
    """
    Зарегистрировать пользователя (создать учётную запись).

    :param email: Электронная почта.
    :param password: Незахэшированный(!) пароль.
    :param first_name: Имя.
    :param last_name: Фамилия.
    :param role: Роль пользователя в системе. Исходя из :class:`..typedefs.user_role.UserRole`.
    :param spec: Список специализаций пользователя. Исходя из :class:`..typedefs.user_spec.UserSpec`.
    :return UserDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_email`, :func:`..utils.check_name`, :func:`..utils.check_password`/пароль небезопасный, :func:`..utils.check_role`.
    """
    db = get_db()
    errors: list[ErrorString] = []

    email = email.lower().strip()
    res = check_email(email)
    if res: errors.append(res)

    first_name = first_name.strip()
    res = check_name(first_name)
    if res: errors.append(res)

    if last_name:
        last_name = last_name.strip()
        res = check_name(last_name, is_last_name=True)
        if res: errors.append(res)

    password = password.strip()
    res = check_password(password)
    if res: errors.append(res)
    if password.casefold() in (email.casefold(), first_name.casefold(), last_name.casefold(), f"{first_name} {last_name}".casefold()):
        errors.append("Пароль небезопасный")
    password_hash = ph.hash(password)

    if role:
        role = role.strip()
        res = check_role(role)
        if res: errors.append(res)

    if spec: spec = check_spec(spec)

    if errors:
        return {"error": errors}

    new_user, err = await db.users.create(
        email,
        password_hash,
        first_name,
        last_name,
        role,
        spec
    )
    if err:
        return {"error": [err]}
    return dict(vars(new_user))

#   Read    #

async def login(
    email: str,
    password: str
) -> UserDict | ErrorsDict:
    """
    Найти пользователя по его почте и паролю.

    :param email: Электронная почта.
    :param password: Незахэшированный(!) пароль.
    :return UserDict: Успех.
    :return ErrorsDict: :func:`..utils.check_email`, :func:`..utils.check_password`, неверная почта или пароль.
    """
    db = get_db()

    email = email.lower().strip()
    res = check_email(email)
    if res: return {'error': [res]}

    password = password.strip()
    res = check_password(password)
    if res: return {'error': [res]}

    user, err = await db.users.read(email=email)
    if err:
        return {"error": ["Неверная почта или пароль"]}

    try:
        ph.verify(user.password_hash, password)
    except VerifyMismatchError:
        return {"error": ["Неверная почта или пароль"]}
    except Exception as e:
        print(f"methods/users.py: login_account(): Ошибка: {e}")
        return {"error": ["Непредвиденная ошибка. Сообщите об этой ошибке"]}
    else:
        old_password_hash = user.password_hash
        if ph.check_needs_rehash(user.password_hash):
            password_hash = ph.hash(password)
            user, err = await db.users.update(
                user.id,
                password_hash=password_hash
            )
            if err:
                user.password_hash = old_password_hash
        return dict(vars(user))

async def read(
    user_id: UserId
) -> UserDict | ErrorsDict:
    """
    Находит учётную запись по UID.

    :param user_id: UID искомой учётной записи.
    :return UserDict: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    user, err = await db.users.read(id=user_id)
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def search(
    email: Optional[str],
    first_name: Optional[str],
    last_name: Optional[str],
    bio: Optional[str],
    role: Optional[str],
    spec: Optional[list[str]]
) -> list[UserDict] | ErrorsDict:
    """
    Находит пользователей по разным параметрам.

    :param email: Электронная почта.
    :param first_name: Имя.
    :param last_name: Фамилия.
    :param role: Роль пользователя в системе. Исходя из :class:`..typedefs.user_role.UserRole`.
    :param spec: Список специализаций пользователя. Исходя из :class:`..typedefs.user_spec.UserSpec`.
    :return list[UserDict]: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()
    error: str | None = None

    searches: dict[str] = {}
    if email:
        email = email.strip()
        res = check_email(email)
        if res: error = res
        searches['email'] = email
    if first_name:
        first_name = first_name.strip()
        res = check_name(first_name)
        if res: error = res
        searches['first_name'] = first_name
    if last_name:
        last_name = last_name.strip()
        res = check_name(last_name, is_last_name=True)
        if res: error = res
        searches['last_name'] = last_name
    if bio:
        bio = bio.strip()
        if not bio: error = 'Пустое описание'
        searches['bio'] = bio
    if role:
        role = role.strip()
        res = check_role(role)
        if res: error = res
        searches['role'] = role
    if spec:
        searches['spec'] = check_spec(spec)

    if not searches:
        return {"error": ["Нужно уточнить хотябы один параметр поиска"]}
    if error:
        return {'error': [error]}

    for key, value in searches.items():
        if not value:
            searches.pop(key)

    users, err = await db.users.readall(**searches)
    if err:
        return {"error": [err]}
    result = {"users": []}
    for user in users:
        result["users"].append(dict(vars(user)))
    return result

#   Update  #

async def change_email(
    user_id: UserId,
    new_email: str
) -> UserDict | ErrorsDict:
    """
    Обновление эл. почты, привязанной к учётной записи.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_email: Новая эл. почта.
    :return UserDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_email`.
    """
    db = get_db()

    new_email = new_email.lower().strip()
    res = check_email(new_email)
    if res: return {'error': [res]}

    user, err = await db.users.update(
        user_id,
        email=new_email
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def change_password(
    user_id: UserId,
    new_password: str
) -> UserDict | ErrorsDict:
    """
    Обновление пароля от учётной записи.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_password: Новый пароль.
    :return UserDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_password`.
    """
    db = get_db()

    user, err = await db.users.read(id=user_id)
    if err:
        return {"error": [err]}

    new_password = new_password.strip()
    res = check_password(new_password)
    if res: return {'error': [res]}

    user_last_name: str = user.last_name or user.first_name
    personal_data = (
        user.email.casefold(),
        user.first_name.casefold(),
        user_last_name.casefold(),
        user.full_name.casefold()
    )
    if new_password.casefold() in personal_data:
        return {"error": ["Слишком простой пароль"]}

    new_password_hash = ph.hash(new_password)
    user, err = await db.users.update(
        user_id,
        password_hash=new_password_hash
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def change_names(
    user_id: UserId,
    new_first_name: Optional[str] = None,
    new_last_name: Optional[str] = None
) -> UserDict | ErrorsDict:
    """
    Обновление имени и фамилии профиля.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_first_name: Новое имя.
    :param new_last_name: Новая фамилия.
    :return UserDict: Успех.
    :return ErrorsDict: Известные ошибки: оба параметра :code:`None`, :func:`..utils.check_name`.
    """
    db = get_db()

    if (new_first_name is None and new_last_name is None) or (not new_first_name.strip() and not new_last_name.strip()):
        return {"error": ["Нужно внести хоть какие-то изменения"]}

    errors: list[ErrorString] = []

    if new_first_name:
        new_first_name = new_first_name.strip()
        res = check_name(new_first_name)
        if res: errors.append(res)

    if new_last_name:
        new_last_name = new_last_name.strip()
        res = check_name(new_last_name, is_last_name=True)
        if res: errors.append(res)

    if errors:
        return {"error": errors}

    user, err = await db.users.update(
        user_id,
        True,
        first_name=new_first_name,
        last_name=new_last_name
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def change_bio(
    user_id: UserId,
    new_bio: Optional[str] = None
) -> UserDict | ErrorsDict:
    """
    Обновление описание профиля.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_bio: Новое описание.
    :return UserDict: Успех.
    :return ErrorsDict: Известные ошибки: :func:`..utils.check_bio`.
    """
    db = get_db()

    if new_bio:
        new_bio = new_bio.strip()
        res = check_bio(new_bio)
        if res: return {'error': [res]}

    updated_user, err = await db.users.update(
        user_id,
        True,
        bio=new_bio
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_user))

async def change_spec(
    user_id: UserId,
    new_spec: Optional[list[str]],
    rewrite: bool = False
) -> UserDict | ErrorsDict:
    """
    Обновляет список специализаций пользователя.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param spec: Список с новыми специализациями. Исходя из :data:`..typedefs.user_spec.UserSpec`.
    :param rewrite: Если :code:`False`, то прибавит с текущему списку специализаций пользователя новые, данные в параметре :code:`new_spec`. Иначе совершит перезапись.
    :return UserDict: Успех.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    if new_spec:
        new_spec = check_spec(new_spec)

        if new_spec is not None:
            user, err = await db.users.read(id=user_id)
            if err:
                return {"error": [err]}

            if not rewrite and user.spec:
                new_spec = user.spec + new_spec
            new_spec = list(set(new_spec))

    updated_user, err = await db.users.update(
        user_id,
        True,
        spec=new_spec
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_user))

#   Delete  #

async def delete(
    user_id: UserId,
) -> BoolResultDict | ErrorsDict:
    """
    Удаление учётной записи.

    :param user_id: UID удаляемой учётной записи.
    :return BoolResultDict: Результат изменений.
    :return ErrorsDict: Ошибка со стороны БД.
    """
    db = get_db()

    result, err = await db.users.delete(user_id)
    if err:
        return {"error": [err]}
    return {"result": result}
