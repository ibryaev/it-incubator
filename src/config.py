from __future__ import annotations
from typing import TYPE_CHECKING
from dotenv import load_dotenv; load_dotenv()
from os import getenv
from zoneinfo import ZoneInfo

if TYPE_CHECKING:
    from typedefs import UserRole, OrderStatus


DB_HOST: str = getenv("DB_HOST", "localhost")
DB_DBNAME: str = getenv("DB_DBNAME", "postgres")
DB_PORT: str = getenv("DB_PORT", "5432")
DB_USER: str = getenv("DB_USER", "postgres")
DB_PASSWORD: str = getenv("DB_PASSWORD")

API_DOMAIN: str = getenv("API_DOMAIN", "127.0.0.1")
API_PORT: int = int(getenv("API_PORT", "8000"))
API_PROTOCOL: str = getenv("API_PROTOCOL", "http")


EMAIL_RESTRICTED_DOMAINS: tuple[str] = (
    "mozmail.com",
    "10minutemail.com"
)
PASSWORD_MIN_LEN:   int = 4 # По умолчанию 4
FIRST_NAME_MAX_LEN: int = 64 # По умолчанию 64
LAST_NAME_MAX_LEN:  int = 64 # По умолчанию 64
BIO_MAX_LEN:        int = 384 # По умолчанию 384
USER_ROLE_DEFAULT:       str = UserRole.CUSTOMER # По умолчанию 'customer'
TITLE_MAX_LEN:      int = 192 # По умолчанию 192
TECHSPEC_MIN_LEN:   int = 128 # По умолчанию 128
ORDER_STATUS_DEFAULT:     str = OrderStatus.CREATED # По умолчанию 'created'
ZONEINFO_DEFAULT: ZoneInfo = ZoneInfo('Europe/Moscow')


user_role_type: tuple[str] = ('customer', 'student', 'manager', 'admin')
user_role: dict[str, str] = {
    "customer": "заказчик",
    "student": "студент",
    "manager": "менеджер",
    "admin": "администратор"
}

user_spec_type: tuple[str] = ('frontend', 'backend', 'fullstack', 'analytic', 'tester', 'designer', 'devops', 'other')
user_spec: dict[str, str] = {
    "frontend": "фронтенд",
    "backend": "бэкенд",
    "fullstack": "фуллстек",
    "analytic": "аналитик",
    "tester": "тестировщик",
    "designer": "дизайнер",
    "devops": "девопс",
    "other": "другое"
}

order_status_type: tuple[str] = ('created', 'taken', 'testing', 'done', 'canceled')
order_status: dict[str, str] = {
    "created": "создан",
    "taken": "взят",
    "testing": "тестируется",
    "done": "готов",
    "canceled": "отменён"
}
