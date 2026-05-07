import database
from asyncio import run

db = database.DbQuery()


async def reg_user(first_name: str):
    if len(first_name) > 64:
        return None

    new_user, err = await db.user_create(first_name)
    return new_user, err

async def get_user(user_id: int, first_name: str = None, last_name: str = None):
    user, err = await db.user_read(id=user_id, first_name=first_name, last_name=last_name)
    return user, err

async def update_user(user_id: int, first_name: str = None, last_name: str = None):
    updated_user = await db.user_update(user_id=user_id, first_name=first_name, last_name=last_name)
    return updated_user

async def deactivate_user(user_id: int):
    return await db.user_delete(user_id)


async def main():
    await db.connect()

    new_user, err = await reg_user("Петя")
    if err is not None:
        return print("Ошибка: " + err)
    last_name = " " + new_user.last_name if new_user.last_name else ""
    print(f"Пользователь {new_user.first_name}{last_name} ({new_user.id}) зарегистрирован!")

    print()

    user, err = await get_user(new_user.id)
    if err is not None:
        return print("Ошибка: " + err)
    for _, j in enumerate(user):
        print(j)

    print()

    updated_user, err = await update_user(user.id, "Пётр", "Петрошевич")
    if err is not None:
        return print("Ошибка: " + err)
    old_last_name = " " + user.last_name if user.last_name else ""
    last_name = " " + updated_user.last_name if updated_user.last_name else ""
    print(f"Пользователь {user.first_name}{old_last_name} ({user.id}) обновил имя! Теперь он {updated_user.first_name}{last_name}.")

    print()

    user, err = await get_user(updated_user.id)
    if err is not None:
        return print("Ошибка: " + err)
    for _, j in enumerate(user):
        print(j)

    print()

    result, err = await deactivate_user(user.id)
    if err is not None:
        return print("Ошибка: " + err)
    if not result:
        return print("Нечего удалять.")
    last_name = " " + user.last_name if user.last_name else ""
    print(f"Пользователь {user.first_name}{last_name} ({user.id}) удалён!")

if __name__ == "__main__":
    run(main())