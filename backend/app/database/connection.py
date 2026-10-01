import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

database_url = os.getenv("database_url")
engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit= False,
                            autoflush = False,
                            bind = engine)

