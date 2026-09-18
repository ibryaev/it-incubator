from __future__ import annotations
from typing import TypedDict, TYPE_CHECKING

if TYPE_CHECKING:
    from .error_string import ErrorString


class ErrorsDict(TypedDict):
    error: list[ErrorString]
