from sqlalchemy import (
    Column, Integer, Date, DateTime, DECIMAL, Enum, ForeignKey, TIMESTAMP, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ReservationStatus(str, enum.Enum):
    booked = "booked"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"
    mobile_money = "mobile_money"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    actual_check_in = Column(DateTime, nullable=True)
    actual_check_out = Column(DateTime, nullable=True)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.booked)
    total_amount = Column(DECIMAL(10, 2), nullable=True)
    created_by = Column(Integer, ForeignKey("staff.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    guest = relationship("Guest", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")
    payments = relationship("Payment", back_populates="reservation")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    paid_at = Column(DateTime, nullable=True)

    reservation = relationship("Reservation", back_populates="payments")
