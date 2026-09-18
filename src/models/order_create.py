from pydantic import BaseModel, Field

from config import TITLE_MAX_LEN, TECHSPEC_MIN_LEN


class OrderCreate(BaseModel):
    title: str      = Field(..., max_length=TITLE_MAX_LEN)
    techspec: str   = Field(..., min_length=TECHSPEC_MIN_LEN)
