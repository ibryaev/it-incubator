from asyncio import run
from config import *
import methods as meth
from utils import user_spec
from typing import Tuple, Optional


async def input_name() -> Tuple[str, Optional[str]]:
    while True:
        first_name = input("Введите имя: ").strip()
        if not first_name:
            continue
        last_name = input("Введите фамилию (опционально): ").strip()
        if not last_name:
            last_name = None
        break
    return first_name, last_name

async def input_spec() -> Optional[list[str]]:
    def bool_yN(string: str) -> Optional[bool]:
        string = string.casefold().strip()
        if not string or string == "n": string = False
        elif string == "y": string = True
        else: string = None
        return string

    spec = []
    while True:
        do_input = bool_yN(input("Желаете уточнить свои специализации? [y/N] "))
        if do_input is None:
            continue
        elif do_input:
            for key, value in user_spec.items():
                while True:
                    s = bool_yN(input(f"{value.title()}? [y/N] "))
                    if s is None:
                        continue
                    if not s:
                        break
                    spec.append(key)
                    break
            return spec
        else:
            return None

async def main():
    from utils.types import User

    first_name, last_name = await input_name()
    spec = await input_spec()

    user = await meth.register_account(first_name, last_name, spec=spec)
    if "error" in user:
        return print(user['error'])
    print(User(**user))

    user = await meth.update_account_bio(user['id'], "Тестовый пользователь.")
    if "error" in user:
        return print(user['error'])
    print(User(**user))

    result = await meth.delete_account(user['id'])
    if "error" in result:
        return print(result['error'])
    elif not result['result']:
        return print("Нечего удалять.")
    print(f"Учётная запись пользователя {user['first_name']} удалена!")

if __name__ == "__main__":
    run(db.connect())
    run(main())


#####################################
#   Через прямое обращение к БД     #
#####################################

    # await db.connect()

    # new_user, err = await db.user_create("Иван")
    # if err:
    #     return print(f"Ошибка: {err}")
    # print(f"Пользовать {new_user.full_name} зарегистрирован! №{new_user.id}\n")

    # user, err = await db.user_read(id=new_user.id)
    # if err:
    #     return print(f"Ошибка: {err}")
    # print(user)
    # print()

    # _, err = await db.user_update(user_id=user.id, last_name="Иванов", role="student", spec=["backend", "tester"])
    # if err:
    #     return print(f"Ошибка: {err}")

    # user, err = await db.user_read(id=user.id)
    # if err:
    #     return print(f"Ошибка: {err}")
    # print(user)
    # print()

    # result, err = await db.user_delete(user.id)
    # if err:
    #     return print(f"Ошибка: {err}")
    # if not result:
    #     return print(f"Удаление {user.full_name} неудалось.")
    # return print(f"Пользователь {user.full_name} удалил учётную запись! №{user.id}")