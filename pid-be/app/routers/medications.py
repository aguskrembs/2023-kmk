from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.models.entities.Auth import Auth
from app.models.entities.Medication import Medication

router = APIRouter(
    prefix="/medications",
    tags=["Medications"],
    responses={404: {"description": "Not found"}},
)

class MedicationCreate(BaseModel):
    name: str
    drug: str
    dose: str

class MedicationUpdate(BaseModel):
    name: str
    drug: str
    dose: str

# Crear una nueva medicación
@router.post("/medications", status_code=status.HTTP_201_CREATED)
def create_medication(medication: MedicationCreate, uid=Depends(Auth.is_logged_in)):
    new_medication = Medication(
        name=medication.name,
        drug=medication.drug,
        dose=medication.dose,
        created_by=uid,
        created_at=datetime.now()
    )
    return new_medication.create()

# Obtener todas las medicaciones
@router.get("/medications", response_model=List[dict])
def get_all_medications():
    return Medication.get_all()

# Obtener una medicación por ID
@router.get("/medications/{med_id}", response_model=dict)
def get_medication_by_id(med_id: str):
    try:
        return Medication.get_by_id(med_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Obtener medicaciones por el ID del médico que las creó
@router.get("/medications/physician", response_model=List[dict])
def get_medications_by_physician(uid=Depends(Auth.is_logged_in)):
    return Medication.get_by_physician(uid)

# Actualizar una medicación existente
@router.put("/medications/{med_id}")
def update_medication(med_id: str, updated_data: MedicationUpdate, uid=Depends(Auth.is_logged_in)):
    medication = Medication.get_by_id(med_id)
    
    if medication["created_by"] != uid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No estas autorizado a editar este medicamento")

    try:
        return Medication.update(med_id, updated_data.dict())
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Eliminar una medicación por ID
@router.delete("/medications/{med_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(med_id: str, uid=Depends(Auth.is_logged_in)):
    medication = Medication.get_by_id(med_id)

    if medication["created_by"] != uid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No estas autorizado a eliminar este medicamento")

    try:
        return Medication.delete(med_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)