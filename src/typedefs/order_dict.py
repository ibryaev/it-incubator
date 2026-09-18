from __future__ import annotations
from typing import TypedDict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from datetime import datetime
    from .order_status import OrderStatus


class OrderDict(TypedDict):
    id: int
    title: str
    techspec: str
    preview_url: Optional[str]
    status: OrderStatus
    customer_id: int
    manager_id: Optional[int]
    students_pinned: Optional[list[int]]
    date_red: datetime
