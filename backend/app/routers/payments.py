from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import (
    get_current_staff,
    get_current_customer,
)
from app.models.reservation import (
    Reservation,
    ReservationStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
)
from app.schemas.payment import PaymentCreate, PaymentOut


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.get("", response_model=List[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    return db.query(Payment).order_by(Payment.id.desc()).all()


@router.post("", response_model=PaymentOut)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    reservation = db.query(Reservation).filter(
        Reservation.id == payload.reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status == ReservationStatus.cancelled:
        raise HTTPException(
            status_code=400,
            detail="Cannot make a payment for a cancelled reservation"
        )

    if payload.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero"
        )

    existing_payments = db.query(Payment).filter(
        Payment.reservation_id == reservation.id,
        Payment.status.in_([
            PaymentStatus.pending,
            PaymentStatus.paid,
        ])
    ).all()

    total_paid = sum(
        (payment.amount for payment in existing_payments),
        Decimal("0.00")
    )

    reservation_total = reservation.total_amount or Decimal("0.00")
    outstanding = reservation_total - total_paid

    if payload.amount > outstanding:
        raise HTTPException(
            status_code=400,
            detail=f"Payment exceeds outstanding balance of K{outstanding:.2f}"
        )

    payment = Payment(
        reservation_id=payload.reservation_id,
        amount=payload.amount,
        method=payload.method,
        status=PaymentStatus.pending,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment

# for customer payments 
@router.post("/customer", response_model=PaymentOut)
def create_customer_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    reservation = db.query(Reservation).filter(
        Reservation.id == payload.reservation_id,
        Reservation.guest_id == current_customer.guest_id,
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status == ReservationStatus.cancelled:
        raise HTTPException(
            status_code=400,
            detail="Cannot make a payment for a cancelled reservation"
        )

    if payload.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero"
        )

    try:
        payment_method = PaymentMethod(payload.method)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )

    existing_payments = db.query(Payment).filter(
        Payment.reservation_id == reservation.id,
        Payment.status.in_([
            PaymentStatus.pending,
            PaymentStatus.paid,
        ])
    ).all()

    total_paid = sum(
        (payment.amount for payment in existing_payments),
        Decimal("0.00")
    )

    reservation_total = reservation.total_amount or Decimal("0.00")
    outstanding = reservation_total - total_paid

    if outstanding <= 0:
        raise HTTPException(
            status_code=400,
            detail="This reservation has already been fully paid"
        )

    if payload.amount > outstanding:
        raise HTTPException(
            status_code=400,
            detail=f"Payment exceeds outstanding balance of K{outstanding:.2f}"
        )

    payment = Payment(
        reservation_id=reservation.id,
        amount=payload.amount,
        method=payment_method,
        status=PaymentStatus.pending,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


@router.get("/customer/my", response_model=List[PaymentOut])
def list_customer_payments(
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    return (
        db.query(Payment)
        .join(Reservation)
        .filter(
            Reservation.guest_id == current_customer.guest_id
        )
        .order_by(Payment.id.desc())
        .all()
    )


@router.post("/{payment_id}/mark-paid", response_model=PaymentOut)
def mark_payment_paid(
    payment_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.status == PaymentStatus.paid:
        raise HTTPException(
            status_code=400,
            detail="Payment is already marked as paid"
        )

    if payment.status == PaymentStatus.refunded:
        raise HTTPException(
            status_code=400,
            detail="A refunded payment cannot be marked as paid"
        )

    payment.status = PaymentStatus.paid
    payment.paid_at = datetime.now()

    db.commit()
    db.refresh(payment)

    return payment


@router.post("/{payment_id}/refund", response_model=PaymentOut)
def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(get_current_staff)
):
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.status != PaymentStatus.paid:
        raise HTTPException(
            status_code=400,
            detail="Only paid payments can be refunded"
        )

    payment.status = PaymentStatus.refunded

    db.commit()
    db.refresh(payment)

    return payment