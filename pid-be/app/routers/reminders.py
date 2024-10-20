from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from app.models.entities.Auth import Auth
from app.models.entities.Reminder import Reminder
from app.models.entities.Prescription import Prescription
from datetime import datetime

router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"],
    responses={404: {"description": "Not found"}},
)

class ReminderCreate(BaseModel):
    prescription_id: str
    time_to_take: str
    frequency_hours: int    # Cambiar a int

@router.post("/")
def create_reminder(reminder: ReminderCreate, uid=Depends(Auth.is_logged_in)):
    # Verificar que la receta exista
    
    prescription = Prescription.get_by_id(reminder.prescription_id)

    if not prescription:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    # Verificar que el paciente de la receta sea el mismo que está creando el recordatorio
    if prescription['patient_id'] != uid:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    try:
        new_reminder = Reminder(
            prescription_id=reminder.prescription_id,
            time_to_take=reminder.time_to_take,
            frequency_hours=reminder.frequency_hours,
            created_by=uid
        )
        return new_reminder.create()
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required field: {e.args[0]}"
        )