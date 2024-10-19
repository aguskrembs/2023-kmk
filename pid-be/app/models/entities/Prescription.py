from fastapi import HTTPException, status
from firebase_admin import firestore
from datetime import datetime
from fpdf import FPDF
import barcode
from barcode.writer import ImageWriter
import os


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
    
    @staticmethod
    def get_by_id(prescription_id):
        return db.collection("prescriptions").document(prescription_id).get().to_dict()
    

    @staticmethod
    def generate_pdf(prescription, physician, patient, med):
        pdf = FPDF()
        pdf.add_page()

        # Logo (Asegúrate de que el archivo logo.png esté en la ruta correcta)
        logo_path = "logo.png"
        if os.path.exists(logo_path):
            pdf.image(logo_path, x=80, y=10, w=50)  # Centrar el logo

        pdf.ln(30)  # Espacio debajo del logo

        # Título
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Receta Médica", ln=True, align='C')
        pdf.ln(10)  # Espacio después del título

        # Generar código de barras para el ID de la receta
        barcode_file = Prescription.generate_barcode(prescription['id']) + ".png"
        if barcode_file and os.path.exists(barcode_file):
            pdf.image(barcode_file, x=80, y=pdf.get_y(), w=50)  # Centrar el código de barras
        pdf.ln(30)

        # Información del paciente
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Paciente: {patient['first_name']} {patient['last_name']}", ln=True, align='L')

        # Medicación y detalles
        pdf.cell(200, 10, txt=f"Medicación: {med['name']} - {med['drug']} {med['dose']}", ln=True, align='L')
        pdf.cell(200, 10, txt=f"Detalles: {prescription['prescription_detail']}", ln=True, align='L')
        pdf.ln(20)

        # Espacio adicional para el resto del contenido antes de la firma del médico
        pdf.ln(10)

        # Mover la posición al final de la página
        pdf.set_y(-60)  # Establecer el cursor en la posición final, -40 es para mantener un margen inferior

        # Información del médico
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Dr. {physician['first_name']} {physician['last_name']} - {physician['specialty']}", ln=True, align='L')
        pdf.cell(200, 10, txt=f"MN: {physician['tuition']}", ln=True, align='L')
        pdf.cell(200, 10, txt=f"Fecha: {prescription['created_at'].strftime('%d/%m/%Y')}", ln=True, align='L')
        # Guardar el PDF
        file_name = f"prescription_{prescription['id']}.pdf"
        pdf.output(file_name)

        # Elimina el archivo de código de barras temporal
        if barcode_file and os.path.exists(barcode_file):
            os.remove(barcode_file)

        return file_name

    @staticmethod
    def generate_barcode(prescription_id):
        if not prescription_id:
            raise ValueError("El ID de la receta no puede estar vacío.")

        prescription_id = str(prescription_id)

        ean = barcode.get('code128', prescription_id, writer=ImageWriter())

        barcode_file = f"barcode_{prescription_id}"
        ean.save(barcode_file)
        print(barcode_file)
        return barcode_file