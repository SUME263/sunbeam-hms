from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class PaymentCreate(BaseModel):
    reservation_id: int
    amount: Decimal
    method: str


class PaymentOut(BaseModel):
    id: int
    reservation_id: int
    amount: Decimal
    method: str
    status: str
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True