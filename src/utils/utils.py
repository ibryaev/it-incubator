user_role_type: tuple[str] = ('customer', 'student', 'manager', 'admin')
user_role: dict[str, str] = {
    "customer": "заказчик",
    "student": "студент",
    "manager": "менеджер",
    "admin": "администратор"
}

user_spec_type: tuple[str] = ('frontend', 'backend', 'fullstack', 'analytic', 'tester', 'designer', 'devops', 'other')
user_spec: dict[str, str] = {
    "frontend": "фронтенд",
    "backend": "бэкенд",
    "fullstack": "фуллстек",
    "analytic": "аналитик",
    "tester": "тестировщик",
    "designer": "дизайнер",
    "devops": "девопс",
    "other": "другое"
}

order_status_type: tuple[str] = ('created', 'taken', 'testing', 'done', 'canceled')
order_status: dict[str, str] = {
    "created": "создан",
    "taken": "взят",
    "testing": "тестируется",
    "done": "готов",
    "canceled": "отменён"
}