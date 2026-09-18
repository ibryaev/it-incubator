from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional

from config import FIRST_NAME_MAX_LEN, LAST_NAME_MAX_LEN, USER_ROLE_DEFAULT


class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str             = Field(..., max_length=FIRST_NAME_MAX_LEN)
    last_name: Optional[str]    = Field(None, max_length=LAST_NAME_MAX_LEN)
    role: Optional[str]         = USER_ROLE_DEFAULT
    spec: Optional[list[str]]   = None
