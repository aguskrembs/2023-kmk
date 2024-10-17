from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.models.entities.Auth import Auth
from app.models.entities.Prescription import Prescription

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"],
    responses={404: {"description": "Not found"}},
)

class PrescriptionCreate(BaseModel):
    appointment_id: str
    med_id: str
    patient_id: str
    prescription_detail: str

# Crear una nueva prescripción
@router.post("/create-prescription", status_code=status.HTTP_201_CREATED)
def create_prescription(prescription: PrescriptionCreate, uid=Depends(Auth.is_logged_in)):
    try:
        new_prescription = Prescription(
            appointment_id=prescription.appointment_id,
            med_id=prescription.med_id,
            patient_id=prescription.patient_id,
            prescription_detail=prescription.prescription_detail,
            created_by=uid
        )
        return new_prescription.create()
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required field: {e.args[0]}"
        )

# Obtener prescripciones de un médico
@router.get("/by-physician", response_model=list)
def get_prescriptions_for_physician(patient_id: str = None, uid=Depends(Auth.is_logged_in)):
    try:
        return Prescription.get_for_physician(physician_id=uid, patient_id=patient_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Obtener prescripciones de un paciente
@router.get("/by-patient", response_model=list)
def get_prescriptions_for_patient(uid=Depends(Auth.is_logged_in)):
    try:
        return Prescription.get_for_patient(patient_id=uid)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)