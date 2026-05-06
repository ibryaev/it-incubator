import database
from asyncio import run

db = database.DbQuery()


async def reg_user(first_name: str, last_name: str):
    if len(first_name) > 64 or len(last_name) > 64:
        return None

    new_user = await db.user_create(first_name=first_name, last_name=last_name)
    return new_user if new_user else None

async def get_user(user_id: int, first_name: str = None):
    if first_name:
        user = await db.user_read(id=user_id, first_name=first_name)
    else:
        user = await db.user_read(id=user_id)
    return user if user else None

async def deactivate_user(user_id: int):
    return await db.user_delete(user_id)


async def main():
    await db.connect()

    new_user = await reg_user("Петя", "Петрушко")
    if new_user is None:
        return print("Ошибка.")
    print(f"Пользователь {new_user.first_name} {new_user.last_name} ({new_user.id}) зарегистрирован!")

    print()

    user = await get_user(new_user.id)
    if user is None:
        return print("Ошибка.")
    for _, j in enumerate(user):
        print(j)

    print()

    result = await deactivate_user(user.id)
    if result:
        return print(f"{user.first_name} ({user.id}) удалён!")
    else:
        return print("Ошибка.")

if __name__ == "__main__":
    run(main())