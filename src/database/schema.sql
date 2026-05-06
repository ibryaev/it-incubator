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


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) DEFAULT NULL,
    bio VARCHAR(384) DEFAULT NULL,
    "role" user_role_type NOT NULL,
    spec user_spec_type[] DEFAULT NULL,
    orders_created INTEGER[] DEFAULT {},
    orders_pinned INTEGER[] DEFAULT {},    
    date_reg TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(192) NOT NULL,
    bio TEXT NOT NULL,
    "status" order_status_type NOT NULL DEFAULT 'created',
    customer_id INTEGER NOT NULL,
    manager_id INTEGER DEFAULT NULL,
    students_pinned INTEGER[] DEFAULT {},
    date_reg TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_manager_id ON orders(manager_id);

COMMIT;