from __future__ import annotations
from dotenv import load_dotenv; load_dotenv()
from os import getenv
from zoneinfo import ZoneInfo

from typedefs import UserRole, UserSpec, OrderStatus


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
"""Запрещённые доменные регистраторы"""
PASSWORD_MIN_LEN: int = 4 # По умолчанию 4
"""Минмальная длинна пароля"""
FIRST_NAME_MAX_LEN: int = 64 # По умолчанию 64
"""Максимальная длинна имени"""
LAST_NAME_MAX_LEN: int = 64 # По умолчанию 64
"""Максимальная длинна фамилии"""
BIO_MAX_LEN: int = 384 # По умолчанию 384
"""Максимальная длина \"О себе\""""
USER_ROLE_DEFAULT: str = UserRole.CUSTOMER # По умолчанию 'customer'
"""Роль по умолчанию у новозарегистрированного пользователя"""
TITLE_MAX_LEN: int = 192 # По умолчанию 192
"""Максимальная длинна названия заказа"""
TECHSPEC_MIN_LEN: int = 128 # По умолчанию 128
"""Максимальная длинна технического задания заказа"""
ORDER_STATUS_DEFAULT: str = OrderStatus.CREATED # По умолчанию 'created'
"""Статус заказа по умолчанию"""
ZONEINFO_DEFAULT: ZoneInfo = ZoneInfo('Europe/Moscow') # По умолчанию 'Europe/Moscow'
"""Часовой пояс по умолчанию"""


user_role_tuple: tuple[str] = (
    UserRole.CUSTOMER,
    UserRole.STUDENT,
    UserRole.MANAGER,
    UserRole.ADMIN
)
"""Список всех ролей, доступных для пользователей"""
user_role_text: dict[str, str] = {
    UserRole.CUSTOMER: "заказчик",
    UserRole.STUDENT:  "студент",
    UserRole.MANAGER:  "менеджер",
    UserRole.ADMIN:    "администратор"
}
"""Название каждой роли на русском языке"""

user_spec_tuple: tuple[str] = (
    UserSpec.FRONTEND,
    UserSpec.BACKEND,
    UserSpec.FULLSTACK,
    UserSpec.ANALYTIC,
    UserSpec.TESTER,
    UserSpec.DESIGNER,
    UserSpec.DEVOPS,
    UserSpec.OTHER
)
"""Список всех специализаций, доступных для пользователей"""
user_spec_text: dict[str, str] = {
    UserSpec.FRONTEND:  "фронтенд",
    UserSpec.BACKEND:   "бэкенд",
    UserSpec.FULLSTACK: "фуллстек",
    UserSpec.ANALYTIC:  "аналитик",
    UserSpec.TESTER:    "тестировщик",
    UserSpec.DESIGNER:  "дизайнер",
    UserSpec.DEVOPS:    "девопс",
    UserSpec.OTHER:     "другое"
}
"""Название каждой специализации на русском языке"""

order_status_tuple: tuple[str] = (
    OrderStatus.CREATED,
    OrderStatus.TAKEN,
    OrderStatus.TESTING,
    OrderStatus.DONE,
    OrderStatus.CANCELED
)
"""Список всех статусов, доступных для заказов"""
order_status_text: dict[str, str] = {
    OrderStatus.CREATED:  "создан",
    OrderStatus.TAKEN:    "взят",
    OrderStatus.TESTING:  "тестируется",
    OrderStatus.DONE:     "готов",
    OrderStatus.CANCELED: "отменён"
}
"""Название каждого статуса на русском языке"""
