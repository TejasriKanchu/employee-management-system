from pydantic import BaseModel

class UserCreate(BaseModel):
    email:str
    password:str
    role:str

class LoginRequest(BaseModel):
    email: str
    password: str 