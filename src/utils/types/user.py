from utils import user_role, user_spec
from datetime import datetime

class User:
    def __init__(
        self,
        id: int,
        first_name: str,
        last_name: str | None = None,
        bio: str | None = None,
        role: str | None = None,
        spec: list[str] | None = None,
        orders_created: list[int] | None = None,
        orders_pinned: list[int] | None = None,
        date_reg: datetime | None = None
    ) -> None:
        self.id=id
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

    def __str__(self) -> str:
        role_text = user_role.get(self.role, "неизвестно")
        bio_text = self.bio or "Нет описания."
        spec_text = [user_spec[spec] for spec in self.spec] if self.spec else []
        spec_text = ", ".join(spec_text) if self.spec else "Специальности не указаны"

        return (
            f"{self.full_name} (№{self.id}) - {role_text}\n"
            f"{bio_text} | {spec_text}.\n"
            f"Дата регистрации: {self.date_reg.strftime('%R')}"
        )