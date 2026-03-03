# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestion Employés")

# Autoriser ton frontend React (port 3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Origines autorisées
    allow_credentials=True,
    allow_methods=["*"],             # Autoriser GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],             # Autoriser tous les headers
)

# Dépendance de session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    existing = crud.get_employee_by_matricule(db, employee.matricule)
    if existing:
        raise HTTPException(status_code=400, detail=f"Matricule '{employee.matricule}' déjà utilisé.")
    return crud.create_employee(db, employee)

@app.get("/employees/", response_model=list[schemas.Employee])
def read_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    return db_employee

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    existing = crud.get_employee_by_matricule(db, employee.matricule)
    if existing and existing.id != employee_id:
        raise HTTPException(status_code=400, detail=f"Matricule '{employee.matricule}' déjà utilisé par un autre employé.")
    return crud.update_employee(db, employee_id, employee)

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    crud.delete_employee(db, employee_id)
    return {"message": "Employé supprimé avec succès"}