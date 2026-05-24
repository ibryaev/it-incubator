from dotenv import load_dotenv; load_dotenv()
from os import getenv
import database

DB_HOST:        str = getenv("DB_HOST", "localhost")
DB_DBNAME:      str = getenv("DB_DBNAME", "postgres")
DB_PORT:        str = getenv("DB_PORT", "5432")
DB_USER:        str = getenv("DB_USER", "postgres")
DB_PASSWORD:    str = getenv("DB_PASSWORD")

API_DOMAIN:     str = getenv("API_DOMAIN", "127.0.0.1")
API_PORT:       int = int(getenv("API_PORT", "8000"))
API_PROTOCOL:   str = getenv("API_PROTOCOL", "http")

db = database.DbQuery()

EMAIL_RESTRICTED_DOMAINS: tuple[str] = (
    "mozmail.com",
    "10minutemail.com"
)
PASSWORD_MIN_LEN:   int = 4             # По умолчанию 4
FIRST_NAME_MAX_LEN: int = 64            # По умолчанию 64
LAST_NAME_MAX_LEN:  int = 64            # По умолчанию 64
BIO_MAX_LEN:        int = 384           # По умолчанию 384
ROLE_DEFAULT:       str = 'customer'    # По умолчанию 'customer'
TITLE_MAX_LEN:      int = 192           # По умолчанию 192
TECHSPEC_MIN_LEN:   int = 128           # По умолчанию 128
STATUS_DEFAULT:     str = 'created'     # По умолчанию 'created'