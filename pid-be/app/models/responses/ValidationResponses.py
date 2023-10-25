from pydantic import BaseModel
from typing import Union

from .PhysicianResponses import PhysicianResponse


class SuccessfullValidationResponse(BaseModel):
    message: str


class ValidationErrorResponse(BaseModel):
    detail: str


class GetPendingValidationsError(BaseModel):
    detail: str


class AllPendingValidationsResponse(BaseModel):
    physicians_pending_validation: list[Union[PhysicianResponse, None]]