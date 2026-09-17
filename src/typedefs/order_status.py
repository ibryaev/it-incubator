from __future__ import annotations
from enum import Enum


class OrderStatus(str, Enum):
    created: str = "created"
    taken: str = "taken"
    testings: str = "testing"
    done: str = "done"
    canceled: str = "canceled"
