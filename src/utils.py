from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime
from zoneinfo import ZoneInfo
from re import fullmatch as re_fullmatch

if TYPE_CHECKING:
    from typedefs import ErrorString

from config import (
    ZONEINFO_DEFAULT,
    EMAIL_RESTRICTED_DOMAINS, PASSWORD_MIN_LEN, FIRST_NAME_MAX_LEN, LAST_NAME_MAX_LEN, BIO_MAX_LEN,
    TITLE_MAX_LEN, TECHSPEC_MIN_LEN,
    user_role_tuple, user_spec_tuple, order_status_tuple
)


def datetime_now(tz: str | ZoneInfo = ZONEINFO_DEFAULT) -> datetime:
    return datetime.now(tz if isinstance(tz, ZoneInfo) else ZoneInfo(tz))


def check_email(email: str) -> None | ErrorString:
    """
    Проверяет что почта не пустая, корректная, и не входит в список запрещённых провайдеров (:data:`..config.EMAIL_RESTRICTED_DOMAINS`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not email:
        return 'Эл. почта обязательное поле'
    elif re_fullmatch(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', email) is None:
        return 'Неккоректная эл. почта'
    elif email.endswith(EMAIL_RESTRICTED_DOMAINS):
        return 'Недопустимый провайдер почты'

def check_password(password: str) -> None | ErrorString:
    """
    Проверяет что пароль не пустой и не слишком короткий (:data:`.config.PASSWORD_MIN_LEN`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not password:
        return 'Пароль обязательное поле'
    elif len(password) < PASSWORD_MIN_LEN:
        return f'Пароль не может быть короче {PASSWORD_MIN_LEN} символов'

def check_name(name: str, is_last_name: bool = False) -> None | ErrorString:
    """
    Проверяет что имя/фамилия не пустое и не слишком длинное (:data:`.config.FIRST_NAME_MAX_LEN` или :data:`.config.LAST_NAME_MAX_LEN`).

    :param is_last_name: Если :code:`True`, то проверяет *name* как фамилию.
    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    name_max_len: int = FIRST_NAME_MAX_LEN
    name_text: str = 'Имя'
    empty_error_text: str = 'обязательное поле'

    if is_last_name:
        name_max_len = LAST_NAME_MAX_LEN
        name_text = 'Фамилия'
        empty_error_text = 'не может быть пустым'

    if not name:
        return f'{name_text} {empty_error_text}'
    elif len(name) > name_max_len:
        return f'{name_text} не может быть длинее {name_max_len} символов'

def check_bio(bio: str) -> None | ErrorString:
    """
    Проверяет что поле "О себе" не пустое и не слишком длинное (:data:`.config.BIO_MAX_LEN`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not bio:
        return '\"О себе\" обязательное поле'
    elif len(bio) > BIO_MAX_LEN:
        return f'Поле \"О себе\" не может быть длинее {BIO_MAX_LEN} символов'

def check_role(role: str) -> None | ErrorString:
    """
    Проверяет что роль не пустая и существует (:data:`.typedefs.user_role.UserRole`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not role:
        return 'Роль обязательное поле'
    elif role not in user_role_tuple:
        return f'Неизвестная роль — {role}'

def check_spec(spec: list[str]) -> list[str] | None:
    """
    Проверяет каждую специальность в списке *spec*, что она не пустая и существует (:data:`..config.user_spec_tuple`).

    :return: Обработанный *spec*.
    """
    uncheked_spec: list[str] = list(spec)
    checked_spec: list[str] | None = []

    for s in uncheked_spec:
        if s in user_spec_tuple:
            s = s.strip()
            if s: checked_spec.append(s)
            else: continue
        else: continue
    if not checked_spec: checked_spec = None

    return checked_spec


def check_title(title: str) -> None | ErrorString:
    """
    Проверяет что название заказа не пустое и не слишком длинное (:data:`.config.TITLE_MAX_LEN`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not title:
        return 'Название проекта обязательное поле'
    elif len(title) > TITLE_MAX_LEN:
        return f'Название проекта не может быть длиннее {TITLE_MAX_LEN}'

def check_techspec(techspec: str) -> None | ErrorString:
    """
    Проверяет что техническое задание не пустое и не слишком короткое (:data:`.config.TECHSPEC_MIN_LEN`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not techspec:
        return 'Техническое задание обязательное поле'
    elif len(techspec) < TECHSPEC_MIN_LEN:
        return f'Техническое задание не может быть короче {TECHSPEC_MIN_LEN}'

def check_status(status: str) -> None | ErrorString:
    """
    Проверяет что статус не пустой и существует (:class:`.typedefs.order_status.OrderStatus`).

    :return None: Успех.
    :return ErrorString: Текст ошибки.
    """
    if not status:
        return 'Статус заказа обязательное поле'
    elif status not in order_status_tuple:
        return f'Неизвестный статус — {status}'
