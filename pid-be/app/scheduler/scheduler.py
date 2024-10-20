from datetime import datetime, timedelta
from firebase_admin import firestore
from app.models.entities.Patient import Patient
from app.models.entities.Prescription import Prescription
from app.models.entities.Medication import Medication
import requests
import asyncio

# Inicializa el cliente de Firestore
db = firestore.client()

async def scheduler():
    print("[%] CHECKING REMINDERS")
    while True:
        print("[%] CHECKING now")

        now = datetime.now()
        
        # Formatear la hora actual a 'HH:MM'
        current_time_str = now.strftime("%H:%M")
        print("CTS: ",current_time_str)

        # Obtener recordatorios desde Firestore
        reminders = db.collection("reminders").get()

        for reminder_doc in reminders:
            reminder_data = reminder_doc.to_dict()

            time_to_take = reminder_data.get("time_to_take")

            if time_to_take == current_time_str:
                await send_reminder_email(reminder_data)
            
            frequency_hours = reminder_data.get("frequency_hours")
            
            if frequency_hours:
                # Sumar la frecuencia en horas para generar el próximo recordatorio
                reminder_time = datetime.strptime(time_to_take, "%H:%M")
                next_time = (reminder_time + timedelta(hours=frequency_hours)).strftime("%H:%M")
                
                # Si el próximo recordatorio coincide con la hora actual
                if next_time == current_time_str:
                    await send_reminder_email(reminder_data)

        # Esperar 60 segundos antes de la próxima verificación
        await asyncio.sleep(60)

async def send_reminder_email(reminder_data):
    """
    Función para enviar el correo de recordatorio utilizando la API de email.
    """
    try:
        # Obtener la información del paciente, prescripción y medicación
        patient = Patient.get_by_id(reminder_data["created_by"])
        prescription = Prescription.get_by_id(reminder_data["prescription_id"])
        medication = Medication.get_by_id(prescription["med_id"])

        # Construir el cuerpo del correo
        email_data = {
            "patient_name": f"{patient['first_name']} {patient['last_name']}",
            "email": patient["email"],
            "medication_name": medication["name"],
            "dose": medication["dose"],
            "time_to_take": reminder_data["time_to_take"],
            "prescription_detail": prescription["prescription_detail"]
        }

        # Llamar a la API de notificaciones para enviar el email
        requests.post(
            "http://localhost:9000/emails/send",
            json={
                "type": "MEDICATION_REMINDER",
                "data": email_data
            }
        )

        print(f"Reminder email sent to {patient['email']} for {medication['name']}.")
    except Exception as e:
        print(f"Failed to send reminder email: {e}")