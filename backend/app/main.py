
from fastapi import FastAPI
from .database.connection import engine,Base
from .database import models
from .routes import employees
from .routes import departments
from .routes import users

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(users.router)

@app.get("/")
def home():
    return {"Message": "Employee Management System API"}