from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import Employee
from ..schemas.employee import EmployeeCreate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/employees")
def get_employees(db:Session = Depends(get_db)):
    return db.query(Employee).all()

@router.get("/employees/{employee_id}")
def get_employee(employee_id:int,db:Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    return employee

@router.post("/employees")
def create_employee(employee: EmployeeCreate, db:Session = Depends(get_db)):
    new_employee = Employee(
        user_id = employee.user_id,
        name = employee.name,
        phone = employee.phone,
        department_id = employee.department_id,
        manager_id = employee.manager_id
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    return new_employee

@router.put("/employees/{employee_id}")
def update_employee(employee_id:int, employee:EmployeeCreate, db:Session = Depends(get_db)):
    existing_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    existing_employee.user_id=employee.user_id
    existing_employee.name = employee.name
    existing_employee.phone = employee.phone
    existing_employee.department_id = employee.department_id
    existing_employee.manager_id =employee.manager_id
    
    db.commit()
    db.refresh(existing_employee)
    
    return existing_employee

@router.delete("/employees/{employee_id}")
def delete_employee(employee_id:int,
                    db : Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    db.delete(employee)
    db.commit()
    
    return {
        "message":"Employee deleted successfully"
    }