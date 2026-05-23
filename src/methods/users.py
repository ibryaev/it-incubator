from typing import Optional
from utils import user_role_type, user_spec_type
from database import *
from config import *

async def register_account(
    email: str,
    password: str,
    first_name: str,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
    spec: Optional[list[str]] = None
) -> dict:
    """
    Регистрирует пользователя (создание учётной записи).

    :param email: Электронная почта, привязанная к учётной записи.
    :param password: Пароль (нехэшированный) к учётной записи.
    :param first_name: Имя. Если длиннее 64 символов - обрезается.
    :param last_name: Фамилия. Если длиннее 64 символов - обрезается.
    :param role: Роль пользователя в системе. Исходя из списка :data:`src.utils.utils.user_role_type`. Если :code:`None`, то выставится значение :code:`"customer"`.
    :param spec: Список специализаций пользователя. Исходя из списка :data:`src.utils.utils.user_spec_type`.
    :return: В случае успеха возвращает словарь с данными пользователя. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    errors: list[str] = []

    email = email.strip()
    if not email:
        errors.append("Эл. почта должна быть заполнена")
    if not "@" in email or not "." in email:
        errors.append("Неккоректная эл. почта")
    if email.endswith(EMAIL_RESTRICTED_DOMAINS):
        errors.append("Недопустимая почта")

    first_name = first_name.strip()
    if not first_name:
        errors.append("Пустое имя")
    if len(first_name) > FIRST_NAME_MAX_LEN:
        errors.append("Слишком длинное имя")

    if last_name:
        last_name = last_name.strip()
        if not last_name:
            last_name = None
        if len(last_name) > LAST_NAME_MAX_LEN:
            errors.append("Слишком длинная фамилия")

    password = password.strip()
    if not password:
        errors.append("Пароль должен быть заполнен")
    if len(password) < PASSWORD_MIN_LEN:
        errors.append("Пароль слишком короткий")
    if password in (email, first_name, last_name, f"{first_name} {last_name}"):
        errors.append("Слишком небезопасный пароль")

    if role:
        role = role.strip()
        if not role:
            errors.append("Пустая роль")
        if role not in user_role_type:
            errors.append(f"Неизвестная роль - {role}")
    if role is None:
        role = ROLE_DEFAULT

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

    if errors:
        return {"error": errors}

    new_user, err = await db.user_create(
        email,
        password,
        first_name,
        last_name,
        role,
        spec
    )
    if err:
        return {"error": [err]}
    return dict(vars(new_user))

async def login_account(
    email: str,
    password: str
) -> dict:
    """
    Находит пользователя по его эл. почте и паролю.

    :param email: Электронная почта, привязанная к учётной записи.
    :param password: Пароль (нехэшированный) к учётной записи.
    :return: В случае успеха возвращает словарь с данными пользователя. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    email = email.strip()
    if not email:
        return {"error": ["Эл. почта должна быть заполнена"]}
    if not "@" in email or not "." in email:
        return {"error": ["Неккоректная эл. почта"]}
    if email.endswith(EMAIL_RESTRICTED_DOMAINS):
        return {"error": ["Недопустимая почта"]}

    password = password.strip()
    if not password:
        return {"error": ["Пароль должен быть заполнен"]}
    if len(password) < PASSWORD_MIN_LEN:
        return {"error": ["Пароль слишком короткий"]}

    user, err = await db.user_read(
        email=email,
        password_hash=password
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def read_account(
    user_id: int
) -> dict:
    """
    Находит учётную запись по UID.

    :param user_id: UID искомой учётной записи.
    :return: В случае успеха возвращает словарь с данными учётной записи. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    user, err = await db.user_read(id=user_id)
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def search_accounts(
    email: Optional[str],
    first_name: Optional[str],
    last_name: Optional[str],
    bio: Optional[str],
    role: Optional[str],
    spec: Optional[list[str]]
) -> dict:
    """
    Находит пользователей по данным параметрам.
    
    :param email: Электронная почта, привязанная к учётной записи.
    :param first_name: Имя.
    :param last_name: Фамилия.
    :param bio: Поле "О себе".
    :param role: Роль пользователя в системе. Исходя из списка :data:`src.utils.utils.user_role_type`.
    :param spec: Список специализаций пользователя. Исходя из списка :data:`src.utils.utils.user_spec_type`.
    :return: В случае успеха возвращает словарь с данными пользователя. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    searches = {}
    if email:
        searches['email'] = email.strip()
    if first_name:
        searches['first_name'] = first_name.strip()
    if last_name:
        searches['last_name'] = last_name.strip()
    if bio:
        searches['bio'] = bio.strip()
    if role:
        searches['role'] = role.strip()
    if spec:
        searches['spec'] = spec

    if not searches:
        return {"error": ["Нужно уточнить хотябы один параметр поиска"]}

    users, err = await db.user_readall(**searches)
    if err:
        return {"error": [err]}
    result = {"users": []}
    for user in users:
        result["users"].append(dict(vars(user)))
    return result

async def update_account_email(
    user_id: int,
    new_email: str
) -> dict:
    """
    Обновление эл. почты, привязанной к учётной записи.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_email: Новая эл. почта.
    """
    new_email = new_email.strip()
    if not new_email:
        return {"error": ["Эл. почта должна быть заполнена"]}
    if not "@" in new_email or not "." in new_email:
        return {"error": ["Неккоректная эл. почта"]}
    if new_email.endswith(EMAIL_RESTRICTED_DOMAINS):
        return {"error": ["Недопустимая почта"]}

    user, err = await db.user_update(
        user_id,
        email=new_email
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def update_account_password(
    user_id: int,
    new_password: str
) -> dict:
    """
    Обновление пароля от учётной записи.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_password: Новый пароль.
    """
    user, err = await db.user_read(id=user_id)
    if err:
        return {"error": [err]}

    new_password = new_password.strip()
    if not new_password:
        return {"error": ["Пароль должен быть заполнен"]}
    if len(new_password) < PASSWORD_MIN_LEN:
        return {"error": ["Пароль слишком короткий"]}
    if new_password in (user.email, user.first_name, user.last_name, user.full_name):
        return {"error": ["Слишком небезопасный пароль"]}

    user, err = await db.user_update(
        user_id,
        password_hash=new_password
    )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def update_account_names(
    user_id: int,
    new_first_name: Optional[str] = None,
    new_last_name: Optional[str] = None
) -> dict:
    """
    Обновление имени, фамилии профиля.  
    Если одно из значений None

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_first_name: Новое имя.
    :param new_last_name: Новая фамилия.
    """
    if (new_first_name is None and new_last_name is None) or (not new_first_name.strip() and not new_last_name.strip()):
        return {"error": ["Нужно внести хоть какие-то изменения"]}

    errors: list[str] = []

    if new_first_name:
        new_first_name = new_first_name.strip()
        if not new_first_name:
            new_first_name = None
        if len(new_first_name) > FIRST_NAME_MAX_LEN:
            errors.append("Слишком длинное имя")

    if new_last_name:
        new_last_name = new_last_name.strip()
        if not new_last_name:
            new_last_name = None
        if len(new_last_name) > LAST_NAME_MAX_LEN:
            errors.append("Слишком длинная фамилия")

    if errors:
        return {"error": errors}

    if new_first_name:
        user, err = await db.user_update(
            user_id,
            True,
            first_name=new_first_name,
            last_name=new_last_name
        )
    else:
        user, err = await db.user_update(
            user_id,
            True,
            last_name=new_last_name
        )
    if err:
        return {"error": [err]}
    return dict(vars(user))

async def update_account_bio(
    user_id: int,
    new_bio: Optional[str] = None
) -> dict:
    """
    Обновление описание профиля.

    :param user_id: UID учётной записи, чьи параметры подлежат обновлению.
    :param new_bio: Новое описание.
    :return: В случае успеха возвращает словарь с уже обновлёнными данными пользователя. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    if new_bio:
        new_bio = new_bio.strip()
        if not new_bio:
            new_bio = None
        if new_bio and len(new_bio) > BIO_MAX_LEN:
            return {"error": ["Описание слишком длинное"]}

    updated_user, err = await db.user_update(
        user_id,
        True,
        bio=new_bio
    )
    if err:
        return {"error": [err]}
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
    :param rewrite: Если :code:`False`, то прибавит с текущему списку специализаций пользователя новые, данные в параметре :code:`spec`. Иначе совершит перезапись.
    :return: В случае успеха возвращает словарь с уже обновлёнными данными пользователя. Иначе: :code:`{"error": [ошибк(а/и)]}`.
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
                return {"error": [err]}

            if not rewrite:
                spec = user.spec + spec
            else:
                pass
            spec = set(spec)

    updated_user, err = await db.user_update(
        user_id,
        True,
        spec=spec
    )
    if err:
        return {"error": [err]}
    return dict(vars(updated_user))

async def delete_account(
    user_id: int,
) -> dict:
    """
    Удаляет учётную запись.

    :param user_id: UID удаляемой учётной записи.
    :return: В случае успеха возвращает словарь :code:`{"result": True/False}`. Иначе: :code:`{"error": [ошибк(а/и)]}`.
    """
    result, err = await db.user_delete(user_id)
    if err:
        return {"error": [err]}
    return {"result": result}