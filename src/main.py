from asyncio import run
from config import *


async def main():
    await db.connect()

    new_user, err = await db.user_create("Иван")
    if err:
        return print(f"Ошибка: {err}")
    print(f"Пользовать {new_user.full_name} зарегистрирован! №{new_user.id}\n")

    user, err = await db.user_read(id=new_user.id)
    if err:
        return print(f"Ошибка: {err}")
    print(user)
    print()

    _, err = await db.user_update(user_id=user.id, last_name="Иванов", role="student", spec=["backend", "tester"])
    if err:
        return print(f"Ошибка: {err}")

    user, err = await db.user_read(id=user.id)
    if err:
        return print(f"Ошибка: {err}")
    print(user)
    print()

    result, err = await db.user_delete(user.id)
    if err:
        return print(f"Ошибка: {err}")
    if not result:
        return print(f"Удаление {user.full_name} неудалось.")
    return print(f"Пользователь {user.full_name} удалил учётную запись! №{user.id}")

if __name__ == "__main__":
    run(main())