from .users import (
    router as router_users,
    user_register, user_login,
    user_read, user_search,
    user_update_email, user_update_password,
    user_update_names, user_update_avatar,
    user_update_bio, user_update_spec,
    user_delete
)
from .orders import (
    router as router_orders,
    order_create,
    order_read,
    order_update_title, order_update_techspec, order_update_preview,
    order_update_status,
    order_update_manager, order_update_students,
    order_delete
)