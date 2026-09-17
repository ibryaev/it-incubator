### Структура

* [main.py](main.py) — Главный файл запуска.
    * **Команда для запуска:** `python src/main.py`.
* [config.py](config.py) — Файл конфигурации - лимиты, значения по умолчанию и так далее. Также подтягивает данные из `.env`.
* [singleton.py](singleton.py) — Singleton.
* [utils.py](utils.py) — Остальные, вспомогательные функции.
* [site/](site/README.md) — Код сайта проекта *(frontend)*.
* [typedefs/](typedefs/__init__.py) — Собственная аннотация.
* [models/](models/__init__.py) — Классы таблиц из базы данных.
* [database/schema.sql](database/schema.sql) — Схема базы данных *(код)*. [Er-формат](../database_schema.md).
* [database/db_query.py](database/db_query.py) — Функции управления БД.м Нет никаких проверок, защит и так далее; сырой ввод.
* [methods/](methods/__init__.py) — Прослойка между базой данных (`db_query.py`) и остальным кодом. Есть проверка вводимых данных и корректный зврат ошибок *(в формате JSON)*.
* [api/](api/__init__.py) — Доступные запросы к API. Минимальные проверки; основная надежда на `methods/`.
    * **TODO** В идеале чтобы в файлах не импортировался класс БД, а только методы.
