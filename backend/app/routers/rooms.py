from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_staff
from app.models.room import Room, RoomType, RoomStatus
from pydantic import BaseModel


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


class RoomCreate(BaseModel):
    room_number: str
    room_type_id: int
    floor: str | None = None
    status: RoomStatus = RoomStatus.available


class RoomOut(BaseModel):
    id: int
    room_number: str
    room_type_id: int
    status: RoomStatus
    floor: str | None = None
    room_type_name: str
    base_price: float
    capacity: int

    class Config:
        from_attributes = True


def room_response(room):
    return {
        "id": room.id,
        "room_number": room.room_number,
        "room_type_id": room.room_type_id,
        "status": room.status,
        "floor": room.floor,
        "room_type_name": room.room_type.name,
        "base_price": float(room.room_type.base_price),
        "capacity": room.room_type.capacity,
    }


@router.get("", response_model=List[RoomOut])
def list_rooms(
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    rooms = (
        db.query(Room)
        .join(RoomType)
        .order_by(Room.room_number.asc())
        .all()
    )

    return [room_response(room) for room in rooms]


@router.get("/{room_id}", response_model=RoomOut)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    return room_response(room)


@router.post("", response_model=RoomOut, status_code=201)
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    existing = (
        db.query(Room)
        .filter(Room.room_number == payload.room_number.strip())
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A room with this room number already exists."
        )

    room_type = (
        db.query(RoomType)
        .filter(RoomType.id == payload.room_type_id)
        .first()
    )

    if not room_type:
        raise HTTPException(
            status_code=404,
            detail="Room type not found."
        )

    room = Room(
        room_number=payload.room_number.strip(),
        room_type_id=payload.room_type_id,
        floor=payload.floor.strip() if payload.floor else None,
        status=payload.status
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room_response(room)


@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found."
        )

    duplicate = (
        db.query(Room)
        .filter(
            Room.room_number == payload.room_number.strip(),
            Room.id != room_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="A room with this room number already exists."
        )

    room_type = (
        db.query(RoomType)
        .filter(RoomType.id == payload.room_type_id)
        .first()
    )

    if not room_type:
        raise HTTPException(
            status_code=404,
            detail="Room type not found."
        )

    room.room_number = payload.room_number.strip()
    room.room_type_id = payload.room_type_id
    room.floor = payload.floor.strip() if payload.floor else None
    room.status = payload.status

    db.commit()
    db.refresh(room)

    return room_response(room)


@router.patch("/{room_id}/status", response_model=RoomOut)
def update_room_status(
    room_id: int,
    status: RoomStatus,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found."
        )

    room.status = status

    db.commit()
    db.refresh(room)

    return room_response(room)