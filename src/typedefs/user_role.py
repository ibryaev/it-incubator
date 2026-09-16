from __future__ import annotations
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER: str = 'customer'
    STUDENT: str = 'student'
    MANAGER: str = 'manager'
    ADMIN: str = 'admin'
