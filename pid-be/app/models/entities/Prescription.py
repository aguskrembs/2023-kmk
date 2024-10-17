from fastapi import HTTPException, status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Prescription:
    appointment_id: str
    med_id: str
    patient_id: str
    prescription_detail: str
    created_by: str
    created_at: datetime

    def __init__(
        self,
        appointment_id: str,
        med_id: str,
        patient_id: str,
        prescription_detail: str,
        created_by: str,
        created_at: datetime = None,
    ):
        self.appointment_id = appointment_id
        self.med_id = med_id
        self.patient_id = patient_id
        self.prescription_detail = prescription_detail
        self.created_by = created_by
        self.created_at = created_at or datetime.now()

    def create(self):
        new_prescription_ref = db.collection("prescriptions").document()
        
        new_prescription_ref.set({
            "id": new_prescription_ref.id,
            "appointment_id": self.appointment_id,
            "med_id": self.med_id,
            "patient_id": self.patient_id,
            "prescription_detail": self.prescription_detail,
            "created_by": self.created_by,
            "created_at": self.created_at,
        })
        self.id = new_prescription_ref.id
        return {"message": "Prescription created successfully", "prescription_id": self.id}
    
    @staticmethod
    def get_for_physician(physician_id, patient_id=None):
        query = db.collection("prescriptions").where("created_by", "==", physician_id)
        
        if patient_id:
            query = query.where("patient_id", "==", patient_id)
        
        prescriptions = query.get()
        return [prescription.to_dict() for prescription in prescriptions]
    
    @staticmethod
    def get_for_patient(patient_id):
        prescriptions = db.collection("prescriptions").where("patient_id", "==", patient_id).get()
        return [prescription.to_dict() for prescription in prescriptions]