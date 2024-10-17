from fastapi import status, HTTPException
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Medication:
    name: str
    drug: str
    dose: str
    created_by: str
    id: str
    created_at: datetime

    def __init__(
        self,
        name: str,
        drug: str,
        dose: str,
        created_by: str,
        id: str = None,
        created_at: datetime = None
    ):
        self.name = name
        self.drug = drug
        self.dose = dose
        self.created_by = created_by
        self.id = id
        self.created_at = created_at or datetime.now()

    def create(self):
        new_med_ref = db.collection("meds").document()
        
        existing_meds = db.collection("meds") \
            .where("name", "==", self.name) \
            .where("drug", "==", self.drug) \
            .where("dose", "==", self.dose) \
            .where("created_by", "==", self.created_by).get()

        if existing_meds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Medicacion ya existente",
            )
        
        new_med_ref.set({
            "id": new_med_ref.id,
            "name": self.name,
            "drug": self.drug,
            "dose": self.dose,
            "created_by": self.created_by,
            "created_at": self.created_at
        })
        self.id = new_med_ref.id
        return {"message": "Medication created successfully", "med_id": self.id}
    
    @staticmethod
    def get_all():
        meds = db.collection("meds").get()
        return [med.to_dict() for med in meds]

    @staticmethod
    def get_by_physician(physician_id):
        meds = db.collection("meds").where("created_by", "==", physician_id).get()
        return [med.to_dict() for med in meds]
    
    @staticmethod
    def get_by_id(med_id):
        med_doc = db.collection("meds").document(med_id).get()
        if not med_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medication not found",
            )
        return med_doc.to_dict()

    @staticmethod
    def update(med_id, updated_data: dict):
        med_ref = db.collection("meds").document(med_id)
        med_doc = med_ref.get()

        if not med_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medication not found",
            )
        med_ref.update(updated_data)
        return {"message": "Medication updated successfully"}

    @staticmethod
    def delete(med_id):
        med_ref = db.collection("meds").document(med_id)
        med_doc = med_ref.get()

        if not med_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medication not found",
            )
        med_ref.delete()
        return {"message": "Medication deleted successfully"}