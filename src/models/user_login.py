from pydantic import BaseModel, Field

from config import PASSWORD_MIN_LEN


class UserLogin(BaseModel):
    email: str
    password: str               = Field(..., min_length=PASSWORD_MIN_LEN)
