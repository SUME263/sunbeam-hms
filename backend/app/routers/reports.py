from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.core.database import get_db
from app.core.security import require_role
from app.models.reservation import Reservation, Payment, PaymentStatus, ReservationStatus
from app.models.room import Room

router = APIRouter(prefix="/reports", tags=["Reporting"])

# Only Administrators may view financial/occupancy reports (RBAC per proposal Objective 5)
admin_only = Depends(require_role("Administrator"))


@router.get("/revenue", dependencies=[admin_only])
def revenue_report(start_date: date, end_date: date, db: Session = Depends(get_db)):
    """Total revenue collected for paid reservations within a date range."""
    total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.status == PaymentStatus.paid,
            Payment.paid_at >= start_date,
            Payment.paid_at <= end_date,
        )
        .scalar()
    )
    return {"start_date": start_date, "end_date": end_date, "total_revenue": float(total)}


@router.get("/occupancy", dependencies=[admin_only])
def occupancy_report(db: Session = Depends(get_db)):
    """Current occupancy rate: occupied rooms / total rooms."""
    total_rooms = db.query(func.count(Room.id)).scalar() or 1
    occupied = db.query(func.count(Room.id)).filter(Room.status == "occupied").scalar()
    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied,
        "occupancy_rate_pct": round((occupied / total_rooms) * 100, 2),
    }


@router.get("/most-booked-rooms", dependencies=[admin_only])
def most_booked_rooms(start_date: date, end_date: date, db: Session = Depends(get_db)):
    """Identifies peak-demand rooms within a period — supports the trend analysis in your proposal."""
    results = (
        db.query(Reservation.room_id, func.count(Reservation.id).label("bookings"))
        .filter(
            Reservation.check_in_date >= start_date,
            Reservation.check_in_date <= end_date,
            Reservation.status != ReservationStatus.cancelled,
        )
        .group_by(Reservation.room_id)
        .order_by(func.count(Reservation.id).desc())
        .all()
    )
    return [{"room_id": r.room_id, "bookings": r.bookings} for r in results]
