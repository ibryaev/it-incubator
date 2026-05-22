from datetime import datetime
from typing import Optional

class Order:
    def __init__(
        self,
        id: int,
        title: str,
        techspec: str,
        status: str,
        preview_url: Optional[str] = None,
        customer_id: Optional[int] = None,
        manager_id: Optional[int] = None,
        students_pinned: Optional[list[int]] = None,
        date_reg: Optional[datetime] = None
    ) -> None:
        self.id=id
        self.title=title
        self.techspec=techspec
        self.preview_url=preview_url
        self.customer_id=customer_id
        self.manager_id=manager_id
        self.status=status
        self.students_pinned=students_pinned
        self.date_reg=date_reg or datetime.now()