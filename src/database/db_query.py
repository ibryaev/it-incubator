from psycopg import AsyncConnection, sql
from psycopg.rows import namedtuple_row
# from psycopg import Error as DbError

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
        '''
        Создаёт пользователя в БД.  
        Для создания пользователя в БД требуется лишь один параметр - имя. Остальное (**kwargs) опционально.
        '''
        try:
            # columns - колонки, которые будут затронуты. params - значения, которые нужно вставить в эти колонки
            # first_name гарантированно есть и идёт первым в таблице, поэтому он сразу добавляется в списки
            columns = [sql.Identifier("first_name")]
            params = [first_name]

            for column, value in kwargs.items():
                if value is not None: # Пустые значения не принимаются. В таком случае подставляется DEFAULT, прописанный в схеме (schema.sql)
                    columns.append(sql.Identifier(column))
                    params.append(value)
            
            query = sql.SQL("INSERT INTO users ({}) VALUES ({}) RETURNING *").format(
                sql.SQL(", ").join(columns),
                sql.SQL(", ").join([sql.Placeholder()] * len(params)) # Заглушек (%s) столько, сколько значений
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                new_user = await cur.fetchone()
                await self.conn.commit()
                return new_user, None
        except Exception as e:
            print(f"database: user_create(): {e}")
            await self.conn.rollback()
            return None, str(e)

    async def user_read(self, allow_None_values: bool = False, **kwargs):
        '''
        Находит ОДНОГО пользователя в БД, по данным параметрам.  
        Если ``allow_None_values`` равен ``True``, то пустые значения тоже будут учитываться. По умолчанию ``False``.
        '''
        try:
            # columns - колонки, которые будут затронуты. params - значения, которые нужно вставить в эти колонки
            columns = []
            params = []

            for column, value in kwargs.items():
                if not allow_None_values and value is None:
                    continue
                columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                params.append(value)

            query = sql.SQL("SELECT * FROM users WHERE {}").format(
                sql.SQL(" AND ").join(columns)
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                user = await cur.fetchone()
                return user, None
        except Exception as e:
            print(f"database: user_read(): {e}")
            return None, str(e)

    async def user_read_all(self, allow_None_values: bool = False, **kwargs):
        '''
        Находит МНОЖЕСТВО пользователей в БД, по данным параметрам.  
        Если ``allow_None_values`` равен ``True``, то пустые значения тоже будут учитываться. По умолчанию ``False``.
        '''
        try:
            # columns - колонки, которые будут затронуты. params - значения, которые нужно вставить в эти колонки
            columns = []
            params = []

            for column, value in kwargs.items():
                if not allow_None_values and value is None:
                    continue
                columns.append(sql.SQL("{} = %s").format(sql.Identifier(column)))
                params.append(value)

            query = sql.SQL("SELECT * FROM users WHERE {}").format(
                sql.SQL(" AND ").join(columns)
            )

            async with self.conn.cursor() as cur:
                await cur.execute(query, params)
                users = await cur.fetchall()
                return users, None
        except Exception as e:
            print(f"database: user_read_all(): {e}")
            return None, str(e)

    async def user_update(self, user_id: int, allow_None_values: bool = False, **kwargs):
        '''
        Обновляет пользователя, у когорого колонка ``id`` равна ``user_id``, в БД.  
        Если ``allow_None_values`` равен ``True``, то пустые значения тоже будут учитываться. По умолчанию ``False``.
        '''
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
                new_user = await cur.fetchone()
                await self.conn.commit()
                return new_user, None
        except Exception as e:
            print(f"database: user_update(): {e}")
            await self.conn.rollback()
            return None, str(e)

    async def user_delete(self, user_id: int) -> bool:
        '''Удаляет пользователя, у когорого колонка ``id`` равна ``user_id``, в БД.'''
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