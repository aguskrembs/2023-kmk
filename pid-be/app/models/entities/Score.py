from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Score:
    appointment_id: str
    physician_score: list
    patient_score: list

    def __init__(
        self,
        appointment_id: str,
        physician_score: list,
        patient_score: list,
    ):
        self.appointment_id = appointment_id
        self.physician_score = physician_score
        self.patient_score = patient_score

    @staticmethod
    def get_by_id(id):
        return db.collection("scores").document(id).get().to_dict()

    @staticmethod
    def get_score(id):
        return db.collection("scores").document(id).get().to_dict()

    @staticmethod
    def add_patient_score(score_data, appointment_id):
        record_ref = db.collection("scores").document(appointment_id)
        record_ref.update({"patient_score": firestore.ArrayUnion([score_data])})

        updated_record = record_ref.get().to_dict()
        return updated_record

    @staticmethod
    def add_physician_score(score_data, appointment_id):
        record_ref = db.collection("scores").document(appointment_id)
        record_ref.update({"physician_score": firestore.ArrayUnion([score_data])})

        updated_record = record_ref.get().to_dict()
        return updated_record

    def create(self):
        # Obtener el documento existente de Firestore
        doc_ref = db.collection("scores").document(self.appointment_id)
        doc = doc_ref.get()

        # Verificar si el documento ya existe
        if doc.exists:
            data = doc.to_dict()

            # Actualizar los campos en la base de datos
            doc_ref.update(
                {
                    "physician_score": self.physician_score,
                    "patient_score": self.patient_score,
                }
            )
        else:
            # Si el documento no existe, establecer los valores por primera vez
            doc_ref.set(
                {
                    "physician_score": self.physician_score,
                    "patient_score": self.patient_score,
                }
            )

        return self.appointment_id
