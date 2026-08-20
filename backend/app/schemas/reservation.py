from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


class GuestCreate(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: str
    id_number: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[str] = None


class GuestOut(GuestCreate):
    id: int

    class Config:
        from_attributes = True


class ReservationCreate(BaseModel):
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: date


class ReservationOut(BaseModel):
    id: int
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: date
    status: str
    total_amount: Optional[Decimal] = None

    class Config:
        from_attributes = True


class RoomAvailabilityQuery(BaseModel):
    check_in_date: date
    check_out_date: date
    room_type_id: Optional[int] = None
