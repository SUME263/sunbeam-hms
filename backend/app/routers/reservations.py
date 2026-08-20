from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List

from app.core.database import get_db
from app.core.security import get_current_staff, require_role
from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus
from app.schemas.reservation import ReservationCreate, ReservationOut, RoomAvailabilityQuery

router = APIRouter(prefix="/reservations", tags=["Reservations & Scheduling"])


def _has_conflict(db: Session, room_id: int, check_in, check_out, exclude_reservation_id=None) -> bool:
    """
    Core double-booking prevention logic.
    Two date ranges overlap if: existing.check_in < new.check_out AND existing.check_out > new.check_in
    Cancelled reservations are ignored.
    """
    query = db.query(Reservation).filter(
        Reservation.room_id == room_id,
        Reservation.status != ReservationStatus.cancelled,
        Reservation.check_in_date < check_out,
        Reservation.check_out_date > check_in,
    )
    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)
    return db.query(query.exists()).scalar()


@router.post("/check-availability")
def check_availability(query: RoomAvailabilityQuery, db: Session = Depends(get_db),
                        current_staff=Depends(get_current_staff)):
    """Returns rooms with no overlapping reservation for the requested date range."""
    rooms_q = db.query(Room).filter(Room.status != RoomStatus.maintenance)
    if query.room_type_id:
        rooms_q = rooms_q.filter(Room.room_type_id == query.room_type_id)

    available = [
        room for room in rooms_q.all()
        if not _has_conflict(db, room.id, query.check_in_date, query.check_out_date)
    ]
    return [{"id": r.id, "room_number": r.room_number, "room_type_id": r.room_type_id} for r in available]


@router.post("", response_model=ReservationOut)
def create_reservation(payload: ReservationCreate, db: Session = Depends(get_db),
                        current_staff=Depends(get_current_staff)):
    """Create a booking. Rejects the request if the room is already booked for an overlapping period."""
    if payload.check_out_date <= payload.check_in_date:
        raise HTTPException(400, "check_out_date must be after check_in_date")

    if _has_conflict(db, payload.room_id, payload.check_in_date, payload.check_out_date):
        raise HTTPException(409, "Room is already booked for the selected dates")

    reservation = Reservation(
        guest_id=payload.guest_id,
        room_id=payload.room_id,
        check_in_date=payload.check_in_date,
        check_out_date=payload.check_out_date,
        status=ReservationStatus.booked,
        created_by=current_staff.id,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.post("/{reservation_id}/check-in", response_model=ReservationOut)
def check_in(reservation_id: int, db: Session = Depends(get_db),
             current_staff=Depends(get_current_staff)):
    from datetime import datetime
    reservation = db.query(Reservation).get(reservation_id)
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    reservation.status = ReservationStatus.checked_in
    reservation.actual_check_in = datetime.utcnow()

    room = db.query(Room).get(reservation.room_id)
    room.status = RoomStatus.occupied

    db.commit()
    db.refresh(reservation)
    return reservation


@router.post("/{reservation_id}/check-out", response_model=ReservationOut)
def check_out(reservation_id: int, db: Session = Depends(get_db),
              current_staff=Depends(get_current_staff)):
    from datetime import datetime
    reservation = db.query(Reservation).get(reservation_id)
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    reservation.status = ReservationStatus.checked_out
    reservation.actual_check_out = datetime.utcnow()

    room = db.query(Room).get(reservation.room_id)
    room.status = RoomStatus.available

    db.commit()
    db.refresh(reservation)
    return reservation


@router.post("/{reservation_id}/cancel", response_model=ReservationOut)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db),
                        current_staff=Depends(require_role("Administrator", "Receptionist"))):
    reservation = db.query(Reservation).get(reservation_id)
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    reservation.status = ReservationStatus.cancelled
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("", response_model=List[ReservationOut])
def list_reservations(db: Session = Depends(get_db), current_staff=Depends(get_current_staff)):
    return db.query(Reservation).order_by(Reservation.check_in_date.desc()).all()
