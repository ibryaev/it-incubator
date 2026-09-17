from __future__ import annotations
from enum import Enum


class UserRole(str, Enum):
    customer: str = 'customer'
    student: str = 'student'
    manager: str = 'manager'
    admin: str = 'admin'
