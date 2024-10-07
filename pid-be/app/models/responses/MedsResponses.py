from pydantic import BaseModel
from typing import Union

class SuccessfulMedResponse(BaseModel):
    message: str

