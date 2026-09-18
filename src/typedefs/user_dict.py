from __future__ import annotations
from typing import TypedDict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from datetime import datetime
    from .user_role import UserRole
    from .user_spec import UserSpec


class UserDict(TypedDict):
    """
    Объект пользователя :class:`..models.user.User` в виде словаря.
    """

    id: int
    email: str
    password_hash: str
    first_name: str
    last_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    role: UserRole
    spec: Optional[list[UserSpec]]
    orders_created: Optional[list[int]]
    orders_pinned: Optional[list[int]]
    date_reg: datetime
