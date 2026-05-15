from psycopg import AsyncConnection, sql
from psycopg.rows import dict_row
from psycopg.errors import UndefinedColumn
from psycopg.types.enum import register_enum, EnumInfo

from enum import Enum
from typing import Optional#, Tuple, Dict

import config
from utils.types import User, Order

class UserRole(str, Enum):
    customer = "customer"
    student = "student"
    manager = "manager"
    admin = "admin"

class UserSpec(str, Enum):
    frontend = "frontend"
    backend = "backend"
    fullstack = "fullstack"
    analytic = "analytic"
    tester = "tester"
    designer = "designer"
    devops = "devops"
    other = "other"

class OrderStatus(str, Enum):
    created = "created"
    taken = "taken"
    testing = "testing"
    done = "done"
    canceled = "canceled"


class DbQuery():
    def __init__(self):
        self.conn = None

    async def connect(self):
        self.conn = await AsyncConnection.connect(
            host        = config.DB_HOST,
            dbname      = config.DB_DBNAME,
            port        = config.DB_PORT,
            user        = config.DB_USER,
            password    = config.DB_PASSWORD,
            row_factory = dict_row
        )

        role_info = await EnumInfo.fetch(self.conn, "user_role_type")
        spec_info = await EnumInfo.fetch(self.conn, "user_spec_type")
        status_info = await EnumInfo.fetch(self.conn, "order_status_type")
        register_enum(role_info, self.conn, UserRole)
        register_enum(spec_info, self.conn, UserSpec)
        register_enum(status_info, self.conn, OrderStatus)

    #####################
    #   Таблица users   #
    #####################

    async def user_create(
        self,
        first_name: str,
        last_name: str | None = None,
        role: str = "customer",
        spec: list[str] | None = None,
    ) -> tuple[Optional[User], Optional[str]]:
        """
        Создаёт пользователя в БД.

        :param first_name: Имя пользователя. Единственный обязательный параметр.
        :param last_name: Фамилия пользователя.
        :param role: Роль человека в системе. Может равняться только :code:`('customer', 'student', 'manager', 'admin')`. По умолчанию :code:`customer`.
        :param spec: Специализации человека. :code:`('frontend', 'backend', 'fullstack', 'analytic', 'tester', 'designer', 'devops', 'other')`.
        :return: Возвращает класс :class:`src.types.user.User`, с данными созданного пользователя.
        """
        try:
            async with self.conn.cursor() as cur:
                await cur.execute(
                    """INSERT INTO users (first_name, last_name, role, spec) VALUES (%s, %s, %s, %s) RETURNING *""",
                    (first_name, last_name, role, spec)
                )
                new_user = await cur.fetchone()
                if new_user is None:
                    return None, "Непредвиденная ошибка. Пользователь не был создан. Сообщите об этой ошибке"
                await self.conn.commit()
                return User(**new_user), None
        except Exception as e:
            print(f"database: user_create(): Ошибка: {e}")
            await self.conn.rollback()
            return None, str(e)

    async def user_read(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> tuple[Optional[User], Optional[str]]:
        """
        Находит ОДНОГО пользователя по заданым параметрам.

        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгий поиск. 
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return: Возвращает класс :class:`src.types.user.User`, с данными пользователя.
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
            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                user = await cur.fetchone()
                if user is None:
                    return None, "Непредвиденная ошибка. Пользователь не был прочитан. Сообщите об этой ошибке"
                return User(**user), None
        except UndefinedColumn as e:
            print(f"database: user_read(): Ошибка: В **kwargs передана несуществующая колонка. {e}")
            return None, str(e)
        except Exception as e:
            print(f"database: user_read(): Ошибка: {e}")
            return None, str(e)

    async def user_readall(
        self,
        allow_None_values: bool = False,
        **kwargs
    ) -> tuple[Optional[list[User]], Optional[str]]:
        """
        Функция идентична :meth:`user_read`, но вместо одного пользователя, возвращает всех, найденных по заданым параметрам.

        :return: Возвращает список, с классами :class:`src.types.user.User` всех найденных пользователей.
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
            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                users = await cur.fetchall()
                if users is None:
                    return None, "Непредвиденная ошибка. Пользователи не был прочитаны. Сообщите об этой ошибке"
                users_classes = []
                for user in users:
                    users_classes.append(User(**user))
                return users_classes, None
        except UndefinedColumn as e:
            print(f"database: user_readall(): Ошибка: В **kwargs передана несуществующая колонка. {e}")
            return None, str(e)
        except Exception as e:
            print(f"database: user_readall(): Ошибка: {e}")
            return None, str(e)

    async def user_update(
        self,
        user_id: int,
        allow_None_values: bool = False,
        **kwargs
    ) -> tuple[Optional[User], Optional[str]]:
        """
        Обновляет колонки данного пользователя, исходя из :code:`**kwargs`.

        :param user_id: ID пользователя, чьи параметры подлежат обновлению.
        :param allow_None_values: Если :code:`False`, то будет пропускать параметры из kwargs, которые равны :code:`None`. Иначе совершает строгое обновление.
        :param **kwargs: Кварги, где ключ должен именоваться как таблица из БД, иначе он просто будет пропущен.
        :return: Возвращает класс :class:`src.types.user.User`, с обновлёнными данными пользователя.
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

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                updated_user = await cur.fetchone()
                if updated_user is None:
                    return None, "Непредвиденная ошибка. Пользователь не был обновлён. Сообщите об этой ошибке"
                await self.conn.commit()
                return updated_user, None
        except UndefinedColumn as e:
            print(f"database: user_update(): Ошибка: В **kwargs передана несуществующая колонка. {e}")
            await self.conn.rollback()
            return None, str(e)
        except Exception as e:
            print(f"database: user_update(): Ошибка: {e}")
            await self.conn.rollback()
            return None, str(e)

    async def user_delete(
        self,
        user_id: int
    ) -> tuple[Optional[bool], Optional[str]]:
        """
        Удаляет данного пользователя из БД.

        :return: Вернёт :code:`True` в случае успеха. Иначе :code:`False`.
        """
        try:
            async with self.conn.cursor() as cur:
                await cur.execute("DELETE FROM users WHERE id = %s", (user_id,))

                if cur.rowcount == 0:
                    return False, None    

                await self.conn.commit()
                return True, None
        except Exception as e:
            print(f"database: user_delete(): {e}")
            await self.conn.rollback()
            return None, str(e)