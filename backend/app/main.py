
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return "Message : Employee Management System API"