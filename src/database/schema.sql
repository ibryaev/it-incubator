BEGIN TRANSACTION;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('customer', 'student', 'manager', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_spec_type') THEN
        CREATE TYPE user_spec_type AS ENUM ('frontend', 'backend', 'fullstack', 'analytic', 'tester', 'designer', 'devops', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_type') THEN
        CREATE TYPE order_status_type AS ENUM ('created', 'taken', 'testing', 'done', 'canceled');
    END IF;
END $$;


CREATE TABLE IF NOT EXISTS users (                      -- Таблица с учётными записями
    id SERIAL PRIMARY KEY,                              -- Уникальный ID (user_id, uid). Просто SERIAL
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(64) NOT NULL,                    -- Имя пользователя. ОБЯЗАТЕЛЬНАЯ КОЛОНКА
    last_name VARCHAR(64) DEFAULT NULL,                 -- Фамилия
    bio VARCHAR(384) DEFAULT NULL,                      -- Краткое описание человека
    "role" user_role_type NOT NULL DEFAULT 'customer',  -- Роль человека в системе: заказчик, студент (исполнитель), преподаватель (менеджер), админ
    spec user_spec_type[] DEFAULT '{}',                 -- Спецификация человека, как и требовалось в ТЗ
    orders_created INTEGER[] DEFAULT '{}',              -- Массив orders(id), созданных этим человеком
    orders_pinned INTEGER[] DEFAULT '{}',               -- Массив orders(id), прикреплённые за этим человеком
    date_reg TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- Дата регистрации в виде UNIX timestamp
);

CREATE TABLE IF NOT EXISTS orders (                                             -- Таблица с заказами
    id SERIAL PRIMARY KEY,                                                      -- Уникальный ID (order_id, oid). Просто SERIAL
    title VARCHAR(192) NOT NULL,                                                -- Название проекта. ОБЯЗАТЕЛЬНАЯ КОЛОНКА
    techspec TEXT NOT NULL,                                                     -- Описание (техническое задание). ОБЯЗАТЕЛЬНАЯ КОЛОНКА
    "status" order_status_type NOT NULL DEFAULT 'created',                      -- Статус заказа: создан, взят в работу, тестируется, готов, отменён
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,        -- users(id) пользователя, который создал заказ. ОБЯЗАТЕЛЬНАЯ КОЛОНКА
    manager_id INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,    -- users(id) менеджера, который взял заказ
    students_pinned INTEGER[] DEFAULT '{}',                                     -- Массив всех users(id), которые закреплены за этим проектом как исполнители
    date_reg TIMESTAMPTZ NOT NULL DEFAULT NOW()                                 -- Дата создания в виде UNIX timestamp
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_manager_id ON orders(manager_id);

COMMIT;