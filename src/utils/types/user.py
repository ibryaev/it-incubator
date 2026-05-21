#from utils import user_role, user_spec
from datetime import datetime
from typing import Optional

class User:
    def __init__(
        self,
        id: int,
        email: str,
        password_hash: str,
        first_name: str,
        last_name: Optional[str] = None,
        bio: Optional[str] = None,
        role: Optional[str] = None,
        spec: Optional[list[str]] = None,
        orders_created: Optional[list[int]] = None,
        orders_pinned: Optional[list[int]] = None,
        date_reg: Optional[datetime] = None
    ) -> None:
        self.id=id
        self.email=email
        self.password_hash=password_hash
        self.first_name=first_name
        self.last_name=last_name
        self.bio=bio
        self.role=role
        self.spec=spec
        self.orders_created=orders_created
        self.orders_pinned=orders_pinned
        self.date_reg=date_reg or datetime.now()

    @property
    def full_name(self) -> str:
        if self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name