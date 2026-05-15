from .user import User
import config as cfg
from datetime import datetime

class Order:
    def __init__(
        self,
        id: int,
        title: str,
        techspec: str,
        customer_id: int | None = None,
        manager_id: int | None = None,
        status: str = "created",
        students_id_pinned: list[int] | None = None,
        date_reg: datetime = datetime.now()
    ) -> None:
        self.id=id
        self.title=title
        self.techspec=techspec
        self.customer_id=customer_id
        self.manager_id=manager_id
        self.status=status
        self.students_id_pinned=students_id_pinned
        self.date_reg=date_reg

    @property
    async def customer(self) -> User:
        return await cfg.db.user_read(id=self.customer_id)

    @property
    async def manager(self) -> User:
        return await cfg.db.user_read(id=self.manager_id)

    @property
    async def students_pinned(self) -> list[User]:
        students_pinned = []
        for student_id in self.students_id_pinned:
            students_pinned.append(await cfg.db.user_read(id=student_id))
        return students_pinned