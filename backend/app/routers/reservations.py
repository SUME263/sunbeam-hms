from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_staff, require_role
from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus
from app.schemas.reservation import (
    ReservationCreate,
    ReservationOut,
    RoomAvailabilityQuery,
)

router = APIRouter(
    prefix="/reservations",
    tags=["Reservations & Scheduling"]
)


def _has_conflict(
    db: Session,
    room_id: int,
    check_in,
    check_out,
    exclude_reservation_id=None
) -> bool:
    """
    Check whether a room already has a reservation
    overlapping the requested dates.

    Cancelled reservations do not block the room.

    Two date ranges overlap when:
        existing check-in < new check-out
        AND
        existing check-out > new check-in
    """

    query = db.query(Reservation).filter(
        Reservation.room_id == room_id,
        Reservation.status != ReservationStatus.cancelled,
        Reservation.check_in_date < check_out,
        Reservation.check_out_date > check_in,
    )

    if exclude_reservation_id:
        query = query.filter(
            Reservation.id != exclude_reservation_id
        )

    return db.query(query.exists()).scalar()


@router.post("/check-availability")
def check_availability(
    query: RoomAvailabilityQuery,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    """
    Return rooms that are available for the requested dates.
    Maintenance rooms and rooms with overlapping reservations
    are excluded.
    """

    if query.check_out_date <= query.check_in_date:
        raise HTTPException(
            status_code=400,
            detail="Check-out date must be after check-in date"
        )

    rooms_q = db.query(Room).filter(
        Room.status != RoomStatus.maintenance
    )

    if query.room_type_id:
        rooms_q = rooms_q.filter(
            Room.room_type_id == query.room_type_id
        )

    available = [
        room
        for room in rooms_q.all()
        if not _has_conflict(
            db,
            room.id,
            query.check_in_date,
            query.check_out_date
        )
    ]

    return [
        {
            "id": room.id,
            "room_number": room.room_number,
            "room_type_id": room.room_type_id,
        }
        for room in available
    ]


@router.post("", response_model=ReservationOut)
def create_reservation(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    """
    Create a new reservation.

    Backend validation:
    - Check-out must be after check-in
    - Guest must exist
    - Room must exist
    - Room cannot be under maintenance
    - Room cannot already be booked for overlapping dates
    """

    # Date validation
    if payload.check_out_date <= payload.check_in_date:
        raise HTTPException(
            status_code=400,
            detail="Check-out date must be after check-in date"
        )

    # Check guest exists
    from app.models.guest import Guest

    guest = db.query(Guest).filter(
        Guest.id == payload.guest_id
    ).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    # Check room exists
    room = db.query(Room).filter(
        Room.id == payload.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # Maintenance rooms cannot be booked
    if room.status == RoomStatus.maintenance:
        raise HTTPException(
            status_code=400,
            detail="This room is currently under maintenance"
        )

    # Prevent double booking
    if _has_conflict(
        db,
        payload.room_id,
        payload.check_in_date,
        payload.check_out_date
    ):
        raise HTTPException(
            status_code=409,
            detail="Room is already booked for the selected dates"
        )

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


@router.post(
    "/{reservation_id}/check-in",
    response_model=ReservationOut
)
def check_in(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    """
    Check a guest into a booked reservation.
    """

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status != ReservationStatus.booked:
        raise HTTPException(
            status_code=400,
            detail="Only booked reservations can be checked in"
        )

    room = db.query(Room).filter(
        Room.id == reservation.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if room.status == RoomStatus.maintenance:
        raise HTTPException(
            status_code=400,
            detail="This room is currently under maintenance"
        )

    reservation.status = ReservationStatus.checked_in
    reservation.actual_check_in = datetime.utcnow()

    room.status = RoomStatus.occupied

    db.commit()
    db.refresh(reservation)

    return reservation


@router.post(
    "/{reservation_id}/check-out",
    response_model=ReservationOut
)
def check_out(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    """
    Check a guest out of an active reservation.
    """

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status != ReservationStatus.checked_in:
        raise HTTPException(
            status_code=400,
            detail="Only checked-in reservations can be checked out"
        )

    room = db.query(Room).filter(
        Room.id == reservation.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    reservation.status = ReservationStatus.checked_out
    reservation.actual_check_out = datetime.utcnow()

    room.status = RoomStatus.available

    db.commit()
    db.refresh(reservation)

    return reservation


@router.post(
    "/{reservation_id}/cancel",
    response_model=ReservationOut
)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(
        require_role("Administrator", "Receptionist")
    )
):
    """
    Cancel a reservation.

    Only booked reservations can be cancelled.
    """

    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status != ReservationStatus.booked:
        raise HTTPException(
            status_code=400,
            detail="Only booked reservations can be cancelled"
        )

    reservation.status = ReservationStatus.cancelled

    db.commit()
    db.refresh(reservation)

    return reservation


@router.get(
    "",
    response_model=List[ReservationOut]
)
def list_reservations(
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    """
    Return all reservations, newest check-in dates first.
    """

    return db.query(Reservation).order_by(
        Reservation.check_in_date.desc()
    ).all()