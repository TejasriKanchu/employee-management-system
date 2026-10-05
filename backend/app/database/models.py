
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .connection import Base

# Department Model
class Department(Base):
    __tablename__="departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable = False)
    description = Column(String, nullable=True)
    
    employees = relationship("Employee",back_populates="department")

#user Model    
class User(Base):
    __tablename__="users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String,unique=True, nullable=False)
    password = Column(String,nullable=False)
    role = Column(String,nullable=False)
    is_Active = Column(Boolean,default=True)
    created_at = Column(DateTime)
    
    employee = relationship("Employee",back_populates="user")

#Employee Model    
class Employee(Base):
    __tablename__="employees"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id"))
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    department_id = Column(Integer,ForeignKey("departments.id"))
    manager_id = Column(Integer,ForeignKey("employees.id"))
    
    user = relationship("User",back_populates="employee")
    
    department = relationship("Department", back_populates="employees")
    
    manager = relationship("Employee",remote_side=[id],back_populates="team_members")
    
    team_members = relationship("Employee",back_populates="manager")
    
#Leave Model
class Leave(Base):
    __tablename__="leaves"
    id = Column(Integer,primary_key=True,index=True)
    employee_id = Column(Integer,ForeignKey("employees.id"))
    leave_type = Column(String,nullable=False)
    reason = Column(String,nullable=False)
    status = Column(String,default="pending")