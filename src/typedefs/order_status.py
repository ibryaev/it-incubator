from __future__ import annotations
from enum import Enum


class OrderStatus(str, Enum):
    CREATED = "created"
    TAKEN = "taken"
    TESTING = "testing"
    DONE = "done"
    CANCELED = "canceled"
