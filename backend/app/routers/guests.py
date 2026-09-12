from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_staff
from app.models.guest import Guest
from app.schemas.reservation import GuestCreate, GuestOut

router = APIRouter(
    prefix="/guests",
    tags=["Guests"]
)


@router.get("", response_model=List[GuestOut])
def list_guests(
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    return (
        db.query(Guest)
        .order_by(Guest.full_name.asc())
        .all()
    )


@router.get("/{guest_id}", response_model=GuestOut)
def get_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    return guest


@router.post("", response_model=GuestOut, status_code=201)
def create_guest(
    payload: GuestCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    guest = Guest(
        full_name=payload.full_name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        id_number=payload.id_number,
        nationality=payload.nationality,
        address=payload.address
    )

    db.add(guest)
    db.commit()
    db.refresh(guest)

    return guest


@router.put("/{guest_id}", response_model=GuestOut)
def update_guest(
    guest_id: int,
    payload: GuestCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    guest.full_name = payload.full_name.strip()
    guest.email = payload.email
    guest.phone = payload.phone.strip()
    guest.id_number = payload.id_number
    guest.nationality = payload.nationality
    guest.address = payload.address

    db.commit()
    db.refresh(guest)

    return guest