from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.models.entities.Auth import Auth
from app.models.entities.Prescription import Prescription
from app.models.entities.Physician import Physician
from app.models.entities.Patient import Patient
from app.models.entities.Medication import Medication
import os

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
    
@router.get("/{prescription_id}/pdf")
def generate_pdf(prescription_id: str, uid=Depends(Auth.is_logged_in)):
    # Obtener los datos de la receta, doctor y paciente
    prescription = Prescription.get_by_id(prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    physician = Physician.get_by_id(prescription.get('created_by'))
    patient = Patient.get_by_id(prescription.get('patient_id'))
    med = Medication.get_by_id(prescription.get('med_id'))

    # Verificar si el usuario es el médico o el paciente asociado a la receta
    if uid != prescription.get('created_by') and uid != prescription.get('patient_id'):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta receta")
    
    # Generar el PDF
    file_name = Prescription.generate_pdf(prescription, physician, patient, med)
    
    # Verificar si el archivo existe
    if not os.path.exists(file_name):
        raise HTTPException(status_code=500, detail="Error al generar el PDF")
    
    # Retornar el archivo como respuesta
    return FileResponse(file_name, media_type='application/pdf', headers={"Content-Disposition": "inline; filename=" + file_name})