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
    frequency_hours: int

@router.post("/")
def create_reminder(reminder: ReminderCreate, uid=Depends(Auth.is_logged_in)):    
    prescription = Prescription.get_by_id(reminder.prescription_id)

    if not prescription:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

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

@router.get("/get_by_prescription_id/{prescription_id}")
def get_reminders_by_prescription(prescription_id: str, uid=Depends(Auth.is_logged_in)):
    prescription = Prescription.get_by_id(prescription_id)

    if not prescription:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if prescription['patient_id'] != uid:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    reminders = Reminder.get_by_prescription_id(prescription_id)

    if not reminders:
        raise HTTPException(status_code=404, detail="No se encontraron recordatorios para esta receta")

    return reminders

@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: str, uid=Depends(Auth.is_logged_in)):
    reminder = Reminder.get_by_id(reminder_id)

    if not reminder:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")

    if reminder["created_by"] != uid:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este recordatorio")

    try:
        Reminder.delete_by_id(reminder_id)
        return {"message": "Recordatorio eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo eliminar el recordatorio: {e}"
        )