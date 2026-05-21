from dotenv import load_dotenv; load_dotenv()
from os import getenv
import database

DB_HOST=getenv("DB_HOST", "localhost")
DB_DBNAME=getenv("DB_DBNAME", "postgres")
DB_PORT=getenv("DB_PORT", "5432")
DB_USER=getenv("DB_USER", "postgres")
DB_PASSWORD=getenv("DB_PASSWORD", "")

API_DOMAIN=getenv("API_DOMAIN", "127.0.0.1")
API_PORT=int(getenv("API_PORT", "8000"))
API_PROTOCOL=getenv("API_PROTOCOL", "http")

db = database.DbQuery()

EMAIL_RESTRICTED_DOMAINS = [
    "mozmail.com",
    "10minutemail.com"
]
PASSWORD_MIN_LEN = 4        # По умолчанию 4
FIRST_NAME_MAX_LEN = 64     # По умолчанию 64
LAST_NAME_MAX_LEN = 64      # По умолчанию 64
BIO_MAX_LEN = 384           # По умолчанию 384
ROLE_DEFAULT = 'customer'   # По умолчанию 'customer'
TITLE_MAX_LEN = 192         # По умолчанию 192
STATUS_DEFAULT = 'created'  # По умолчанию 'created'