from __future__ import annotations
from datetime import datetime
from zoneinfo import ZoneInfo

from config import ZONEINFO_DEFAULT


def datetime_now(tz: str | ZoneInfo = ZONEINFO_DEFAULT) -> datetime:
    return datetime.now(tz if isinstance(tz, ZoneInfo) else ZoneInfo(tz))
