from fastapi import HTTPException, status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Reminder:
    prescription_id: str
    time_to_take: datetime
    frequency_hours: int
    created_by: str
    created_at: datetime

    def __init__(
        self,
        prescription_id: str,
        time_to_take: datetime,
        frequency_hours: int,
        created_by: str,
        created_at: datetime = None
    ):
        self.prescription_id = prescription_id
        self.time_to_take = time_to_take
        self.frequency_hours = frequency_hours
        self.created_by = created_by
        self.created_at = created_at or datetime.now()

    def create(self):
        existing_reminders = db.collection("reminders") \
            .where("prescription_id", "==", self.prescription_id) \
            .where("time_to_take", "==", self.time_to_take) \
            .where("created_by", "==", self.created_by).get()

        if existing_reminders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reminder already exists"
            )
        new_reminder_ref = db.collection("reminders").document()
        
        new_reminder_ref.set({
            "id": new_reminder_ref.id,
            "prescription_id": self.prescription_id,
            "time_to_take": self.time_to_take,
            "frequency_hours": self.frequency_hours,
            "created_by": self.created_by,
            "created_at": self.created_at,
        })
        self.id = new_reminder_ref.id
        return {"message": "Reminder created successfully", "reminder_id": self.id}

    @staticmethod
    def get_by_id(reminder_id):
        reminder = db.collection("reminders").document(reminder_id).get().to_dict()
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        return reminder