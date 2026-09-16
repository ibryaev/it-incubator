from fastapi import FastAPI
from uvicorn import run
from contextlib import asynccontextmanager

from api import router_users, router_orders
from config import API_DOMAIN, API_PORT
from database import DbQuery
from singleton import set_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = await DbQuery.connect()
    set_db(db)
    print(1)
    yield
    if db.conn:
        await db.conn.close()
        print(0)

app = FastAPI(lifespan=lifespan)
app.include_router(router_users)
app.include_router(router_orders)

if __name__ == "__main__":
    run("main:app", host=API_DOMAIN, port=API_PORT, reload=True)
