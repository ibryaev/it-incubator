from __future__ import annotations
from typing import Optional, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from typedefs import ErrorString, UserId, OrderId

from psycopg import AsyncConnection, sql
from psycopg.rows import dict_row
from psycopg.errors import UndefinedColumn
from psycopg.types.enum import register_enum, EnumInfo

from config import (
    DB_HOST, DB_DBNAME, DB_PORT, DB_USER, DB_PASSWORD,
    USER_ROLE_DEFAULT
)
from typedefs import UserRole, UserSpec, OrderStatus
from models import User, Order


class TableUsers:
    """
    Таблица с пользователями (:code:`users`).
    """

    def __init__(self, conn: AsyncConnection):
        self._conn=conn

    async def create(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: Optional[str] = None,
        role: str = USER_ROLE_DEFAULT,
        spec: Optional[list[str]] = None,
    ) -> Tuple[Optional[User], Optional[ErrorString]]:
        """
        Создать учётную запись.

        :param email: Электронная почта.
        :param password: Захэшированный(!) пароль.
        :param first_name: Имя.
        :param last_name: Фамилия.
        :param role: Роль пользователя в системе. Исходя из :class:`..typedefs.user_role.UserRole`.
        :param spec: Список специализаций пользователя. Исходя из :class:`..typedefs.user_spec.UserSpec`.
        :return Успех: :class:`..models.user.User`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT 1 FROM users WHERE email = %s
                    """,
                    (email,)
                )
                result = await cur.fetchone()
                if result:
                    return None, "Учётная запись с такой эл. почтой уже существует"

                await cur.execute(
                    """
                    INSERT INTO users (email, password_hash, first_name, last_name, role, spec)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                    """,
                    (email, password, first_name, last_name, role, spec)
                )
                new_user = await cur.fetchone()

                if new_user is None:
                    await self._conn.rollback()
                    return None, "Непредвиденная ошибка. Пользователь не был создан. Сообщите об этой ошибке"
                await self._conn.commit()
                return User(**new_user), None

        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

    async def read(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[User], Optional[ErrorString]]:
        """
        Находит одного пользователя по заданым параметрам.

        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгий поиск. 
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: :class:`..models.user.User`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        columns = []
        params = []

        # Выстраивание запроса и значений (query & params)
        for column, value in kwargs.items():
            if not allow_None_values and value is None:
                continue
            columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
            params.append(value)

        query = sql.SQL("SELECT * FROM users WHERE {}").format(
            sql.SQL(" AND ").join(columns)
        )

        # Выполнение
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                user = await cur.fetchone()
                if user is None:
                    return None, "Ошибка. Пользователь не найден"
                return User(**user), None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            return None, str(e)
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            return None, str(e)

    async def readall(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[list[User]], Optional[ErrorString]]:
        """
        Функция идентична :meth:`read`, но вместо одного пользователя, возвращает всех, найденных по заданым параметрам.

        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгий поиск. 
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: Список :class:`..models.user.User`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        columns = []
        params = []

        # Выстраивание запроса и значений (query & params)
        for column, value in kwargs.items():
            if not allow_None_values and value is None:
                continue
            columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
            params.append(value)

        query = sql.SQL("SELECT * FROM users WHERE {}").format(
            sql.SQL(" AND ").join(columns)
        )

        # Выполнение
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                users = await cur.fetchall()
                if users is None:
                    return None, "Ошибка. По данным критериям никто не был найден"
                users_classes = []
                for user in users:
                    users_classes.append(User(**user))
                return users_classes, None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            return None, str(e)
        except Exception as e:
            print(f"database: user_readall(): Непредвиденная ошибка: {e}")
            return None, str(e)

    async def update(
        self,
        user_id: UserId,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[User], Optional[ErrorString]]:
        """
        Обновляет колонки данного пользователя, исходя из :code:`**kwargs`.

        :param user_id: UID пользователя, чьи параметры подлежат обновлению.
        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгое обновление.
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: :class:`..models.user.User`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            # columns - колонки, которые будут затронуты. params - значения, которые нужно вставить в эти колонки
            columns = []
            params = []

            for column, value in kwargs.items():
                if not allow_None_values and value is None:
                    continue
                columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                params.append(value)
            
            query = sql.SQL("UPDATE users SET {} WHERE id = %s RETURNING *").format(sql.SQL(", ").join(columns))
            params.append(user_id)

            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                updated_user = await cur.fetchone()
                if updated_user is None:
                    await self._conn.rollback()
                    return None, "Непредвиденная ошибка. Пользователь не был обновлён. Сообщите об этой ошибке"
                await self._conn.commit()
                return User(**updated_user), None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            await self._conn.rollback()
            return None, str(e)
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

    async def delete(
        self,
        user_id: UserId
    ) -> Tuple[Optional[bool], Optional[ErrorString]]:
        """
        Удаляет данного пользователя из БД.

        :return Успех: :code:`bool`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(
                    """
                    DELETE FROM users WHERE id = %s
                    """,
                    (user_id,)
                )

                if cur.rowcount == 0:
                    return False, None    

                await self._conn.commit()
                return True, None
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

class TableOrders:
    """
    Таблица с заказами (:code:`orders`).
    """

    def __init__(self, conn: AsyncConnection, table_users: TableUsers) -> None:
        self._conn=conn
        self._users=table_users

    async def create(
        self,
        title: str,
        techspec: str,
        customer_id: UserId        
    ) -> Tuple[Optional[Order], Optional[ErrorString]]:
        """
        Создать заказ.

        :param title: Название проекта.
        :param techspec: Описание (техническое задание).
        :param customer_id: UID учётной записи, которая создала заказ.
        :return Успех: :class:`..models.order.Order`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            async with self._conn.cursor() as cur:
                _, err = await self._users.read(id=customer_id)
                if err:
                    return None, err

                await cur.execute(
                    """
                    INSERT INTO orders (title, techspec, customer_id)
                    VALUES (%s, %s, %s)
                    RETURNING *
                    """,
                    (title, techspec, customer_id)
                )
                new_order = await cur.fetchone()
                if new_order is None:
                    await self._conn.rollback()
                    return None, "Непредвиденная ошибка. Заказ не был создан. Сообщите об этой ошибке"
                await self._conn.commit()
                return Order(**new_order), None

        except Exception as e:
            print(F"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

    async def read(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[Order], Optional[ErrorString]]:
        """
        Находит один заказ по заданым параметрам.

        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгий поиск. 
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: :class:`..models.order.Order`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        columns = []
        params = []

        # Выстраивание запроса и значений (query & params)
        for column, value in kwargs.items():
            if not allow_None_values and value is None:
                continue
            columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
            params.append(value)

        query = sql.SQL("SELECT * FROM orders WHERE {}").format(
            sql.SQL(" AND ").join(columns)
        )

        # Выполнение
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                order = await cur.fetchone()
                if order is None:
                    return None, "Заказ не найден"
                return Order(**order), None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            return None, str(e)
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            return None, str(e)

    async def readall(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[list[Order]], Optional[ErrorString]]:
        """
        Функция идентична :meth:`read`, но вместо одного заказа, возвращает все найденные по заданым параметрам.

        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгий поиск. 
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: Список :class:`..models.order.Order`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        columns = []
        params = []

        # Выстраивание запроса и значений (query & params)
        for column, value in kwargs.items():
            if not allow_None_values and value is None:
                continue
            columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
            params.append(value)

        query = sql.SQL("SELECT * FROM orders WHERE {}").format(
            sql.SQL(" AND ").join(columns)
        )

        # Выполнение
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                orders = await cur.fetchall()
                if orders is None:
                    return None, "Ошибка. По данным критериям ничего не было найдено"
                orders_classes = []
                for order in orders:
                    orders_classes.append(Order(**order))
                return orders_classes, None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            return None, str(e)
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            return None, str(e)

    async def update(
        self,
        order_id: OrderId,
        allow_None_values: bool = False,
        **kwargs
    ) -> Tuple[Optional[Order], Optional[ErrorString]]:
        """
        Обновляет колонки данного заказа, исходя из :code:`**kwargs`.

        :param order_id: OID заказа, чьи параметры подлежат обновлению.
        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгое обновление.
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return Успех: :class:`..models.order.Order`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            # columns - колонки, которые будут затронуты. params - значения, которые нужно вставить в эти колонки
            columns = []
            params = []

            for column, value in kwargs.items():
                if not allow_None_values and value is None:
                    continue
                columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                params.append(value)
            
            query = sql.SQL("UPDATE orders SET {} WHERE id = %s RETURNING *").format(sql.SQL(", ").join(columns))
            params.append(order_id)

            async with self._conn.cursor() as cur:
                await cur.execute(query, params)
                updated_order = await cur.fetchone()
                if updated_order is None:
                    await self._conn.rollback()
                    return None, "Непредвиденная ошибка. Заказ не был обновлён. Сообщите об этой ошибке"
                await self._conn.commit()
                return Order(**updated_order), None

        except UndefinedColumn as e:
            print(f"{__name__}: В **kwargs передана несуществующая колонка ({e})")
            await self._conn.rollback()
            return None, str(e)
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

    async def delete(
        self,
        order_id: OrderId
    ) -> Tuple[Optional[bool], Optional[ErrorString]]:
        """
        Удаляет данный заказ из БД.

        :return Успех: :code:`bool`, :code:`None`.
        :return Ошибка: :code:`None`, :class:`..typedefs.error_string.ErrorString`.
        """
        try:
            async with self._conn.cursor() as cur:
                await cur.execute(
                    """
                    DELETE FROM orders WHERE id = %s
                    """,
                    (order_id,)
                )

                if cur.rowcount == 0:
                    return False, None    

                await self._conn.commit()
                return True, None
        except Exception as e:
            print(f"{__name__}: Непредвиденная ошибка: {e}")
            await self._conn.rollback()
            return None, str(e)

class DbQuery:
    """Объект базы данных"""

    conn: AsyncConnection
    """Объект подключения к БД"""
    users: TableUsers
    """Таблица с пользователями"""
    orders: TableOrders
    """Таблица с заказами"""

    def __init__(self, conn: AsyncConnection) -> None:
        self.conn=conn
        self.users=TableUsers(conn)
        self.orders=TableOrders(conn, self.users)

    @classmethod
    async def connect(cls) -> DbQuery:
        conn = await AsyncConnection.connect(
            host        = DB_HOST,
            dbname      = DB_DBNAME,
            port        = DB_PORT,
            user        = DB_USER,
            password    = DB_PASSWORD,
            row_factory = dict_row
        )

        user_role_type = await EnumInfo.fetch(conn, "user_role_type")
        user_spec_type = await EnumInfo.fetch(conn, "user_spec_type")
        order_status_type = await EnumInfo.fetch(conn, "order_status_type")
        register_enum(user_role_type, conn, UserRole)
        register_enum(user_spec_type, conn, UserSpec)
        register_enum(order_status_type, conn, OrderStatus)

        return cls(conn)
