from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import User
from ..schemas.user import UserCreate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.post("/users")
def create_user(user:UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        email=user.email,
        password = user.password,
        role = user.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/users")
def get_user(db: Session = Depends(get_db)):
    users =db.query(User).all()
    
    return users

@router.get("/users/{user_id}")
def get_user(user_id:int,
             db:Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return user

@router.put("/users/{user_id}")
def update_user(user_id:int, user:UserCreate,db:Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()
    
    existing_user.email = user.email
    existing_user.password = user.password
    existing_user.role = user.role
    
    db.commit()   
    db.refresh(existing_user)
    
    return existing_user

@router.delete("/users/{user_id}")
def delete_user(user_id:int,db:Session=Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)
    db.commit()
    
    return {"message":"user Deleted Successfully"}