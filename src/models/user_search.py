from pydantic import BaseModel, Field
from typing import Optional

from config import FIRST_NAME_MAX_LEN, LAST_NAME_MAX_LEN, BIO_MAX_LEN


class UserSearch(BaseModel):
    email: Optional[str]        = None
    first_name: Optional[str]   = Field(None, max_length=FIRST_NAME_MAX_LEN)
    last_name: Optional[str]    = Field(None, max_length=LAST_NAME_MAX_LEN)
    bio: Optional[str]          = Field(None, max_length=BIO_MAX_LEN)
    role: Optional[str]         = None
    spec: Optional[list[str]]   = None
