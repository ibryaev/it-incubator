from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database import DbQuery


_db: DbQuery | None = None


def set_db(db: DbQuery) -> None:
    global _db
    _db = db

def get_db() -> DbQuery:
    global _db
    if _db is None:
        raise Exception('Database is not initialized?')
    return _db
