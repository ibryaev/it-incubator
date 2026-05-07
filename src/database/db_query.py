from psycopg import AsyncConnection, sql
from psycopg.rows import namedtuple_row

import config

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
            row_factory = namedtuple_row
        )

    async def user_create(self, first_name: str, **kwargs):
        try:
            columns = [sql.Identifier("first_name")]
            params = [first_name]
            optional_columns = {"last_name", "bio", "role", "spec", "orders_created", "orders_pinned"}

            for column, value in kwargs.items():
                if column in optional_columns and value is not None:
                    columns.append(sql.Identifier(column))
                    params.append(value)
            
            query = sql.SQL("INSERT INTO users ({}) VALUES ({}) RETURNING *").format(
                sql.SQL(", ").join(columns),
                sql.SQL(", ").join([sql.Placeholder()] * len(columns))
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                new_user = await cur.fetchone()
                await self.conn.commit()
                return new_user
        except Exception as e:
            print(f"database: user_create(): {e}")
            await self.conn.rollback()
            return None

    async def user_read(self, allow_None_values: bool = False, **kwargs):
        try:
            columns = []
            params = []

            for column, value in kwargs.items():
                if not allow_None_values and value is not None:
                    columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                    params.append(value)

            query = sql.SQL("SELECT * FROM users WHERE {}").format(
                sql.SQL(" AND ").join(columns)
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                user = await cur.fetchone()
                return user
        except Exception as e:
            print(f"database: user_read(): {e}")
            return None

    async def user_read_all(self, **kwargs):
        try:
            columns = []
            params = []

            for column, value in kwargs.items():
                columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                params.append(value)

            query = sql.SQL("SELECT * FROM users WHERE {}").format(
                sql.SQL(" AND ").join(columns)
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                users = await cur.fetchall()
                return users
        except Exception as e:
            print(f"database: user_read_all(): {e}")
            return None

    async def user_update(self, user_id: int, **kwargs):
        try:
            columns = []
            params = []
            aviable_columns = {"first_name", "last_name", "bio", "role", "spec", "orders_created", "orders_pinned"}

            for column, value in kwargs.items():
                if column in aviable_columns and value is not None:
                    columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                    params.append(value)
            
            query = sql.SQL("UPDATE users SET {} WHERE id = %s RETURNING *").format(sql.SQL(", ").join(columns))
            params.append(user_id)

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                new_user = await cur.fetchone()
                await self.conn.commit()
                return new_user
        except Exception as e:
            print(f"database: user_update(): {e}")
            await self.conn.rollback()
            return None

    async def user_delete(self, user_id: int) -> bool:
        try:
            async with self.conn.cursor() as cur:
                await cur.execute("DELETE FROM users WHERE id = %s", (user_id,))

                if cur.rowcount == 0:
                    return False                

                await self.conn.commit()
                return True
        except Exception as e:
            print(f"database: user_delete(): {e}")
            await self.conn.rollback()
            return None