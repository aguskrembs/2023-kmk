import requests
from datetime import datetime
from typing import Dict
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from app.config import EMAIL_API_ROOT

from app.models.requests.PhysicianRequests import AgendaUpdateRequest

from app.models.entities.Auth import Auth
from app.models.entities.Physician import Physician
from app.models.entities.Patient import Patient
from app.models.entities.Appointment import Appointment
from app.models.responses.PhysicianResponses import (
    GetPhysiciansResponse,
    GetPhysiciansError,
)
from app.models.responses.ValidationResponses import (
    SuccessfullValidationResponse,
    ValidationErrorResponse,
)
from app.models.responses.AppointmentResponses import (
    AllAppointmentsResponse,
    GetAppointmentError,
)

router = APIRouter(
    prefix="/physicians",
    tags=["Physicians"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/specialty/{specialty_name}",
    status_code=status.HTTP_200_OK,
    response_model=GetPhysiciansResponse,
    responses={
        401: {"model": GetPhysiciansError},
        500: {"model": GetPhysiciansError},
    },
)
def get_physicians_by_specialty(specialty_name: str, uid=Depends(Auth.is_logged_in)):
    """
    Get all physicians by location.

    This will allow authenticated users to retrieve all physicians that are specialized in chosen specialty.

    This path operation will:

    * Return all the physicians in the system that match the given specialty.
    * Throw an error if physician retrieving fails.
    """
    try:
        physicians = Physician.get_by_specialty(specialty_name)
        return {"physicians": physicians}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/approve-appointment/{appointment_id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullValidationResponse,
    responses={
        400: {"model": ValidationErrorResponse},
        401: {"model": ValidationErrorResponse},
        403: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
)
async def approve_appointment(appointment_id: str, uid=Depends(Auth.is_logged_in)):
    """
    Validate an appointment.

    This will allow physicians to approve appointments.

    This path operation will:

    * Validate an appointment.
    * Change the _approved_ field from Appointments from _pending_ to _approved_.
    * Throw an error if the validation fails.
    """
    try:
        if not Appointment.is_appointment(appointment_id):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Can only approve appointments"},
            )
        Physician.approve_appointment(appointment_id)

        appointment = Appointment.get_by_id(appointment_id)
        patient = Patient.get_by_id(appointment.patient_id)
        physician = Physician.get_by_id(appointment.physician_id)
        date = datetime.fromtimestamp(appointment.date)
        requests.post(
            f"{EMAIL_API_ROOT}/emails/send",
            json={
                "type": "APPROVED_APPOINTMENT"
                if not appointment.updated_at
                else "APPROVED_UPDATED_APPOINTMENT",
                "data": {
                    "physician_first_name": physician["first_name"],
                    "physician_last_name": physician["last_name"],
                    "email": patient["email"],
                    "day": date.day,
                    "month": date.month,
                    "year": date.year,
                    "hour": date.hour,
                    "minute": date.minute,
                },
            },
        )
        return {"message": "Appointment approved successfully"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/deny-appointment/{appointment_id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullValidationResponse,
    responses={
        400: {"model": ValidationErrorResponse},
        401: {"model": ValidationErrorResponse},
        403: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
)
async def deny_appointment(appointment_id: str, uid=Depends(Auth.is_logged_in)):
    """
    Validate an appointment.

    This will allow physicians to deny appointments.

    This path operation will:

    * Validate an appointment.
    * Change the _approved_ field from Appointments from _pending_ to _denied_.
    * Throw an error if the validation fails.
    """
    try:
        if not Appointment.is_appointment(appointment_id):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Can only deny appointments"},
            )
        Physician.deny_appointment(appointment_id)
        return {"message": "Appointment denied successfully"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/pending-appointments",
    status_code=status.HTTP_200_OK,
    response_model=AllAppointmentsResponse,
    responses={
        401: {"model": GetAppointmentError},
        403: {"model": GetAppointmentError},
        500: {"model": GetAppointmentError},
    },
)
def get_all_pending_appointments(uid=Depends(Auth.is_logged_in)):
    """
    Get all appointments pending approval.

    This will allow physicians to retrieve all pending appointments.

    This path operation will:

    * Return all of the appointments from a physician pending validations.
    * Throw an error if appointment retrieving fails.
    """
    try:
        appointments_to_validate = Appointment.get_pending_appointments(uid)
        return {"appointments": appointments_to_validate}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.put("/agenda", status_code=status.HTTP_200_OK)
def update_physicians_agenda(
    agenda_update_request: Dict[str, AgendaUpdateRequest],
    uid=Depends(Auth.is_logged_in),
):
    try:
        for day in agenda_update_request:
            agenda_update_request[day] = agenda_update_request[day].model_dump()
        Physician.update_agenda(id=uid, agenda=agenda_update_request)
        return {"message": "Agenda updated successfully"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )