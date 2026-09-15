from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
)
from app.models.staff import Staff
from app.models.customer import Customer
from app.models.guest import Guest
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    CustomerRegisterRequest,
    CustomerTokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Staff login.
    """
    staff = db.query(Staff).filter(Staff.email == payload.email).first()

    if not staff or not verify_password(payload.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not staff.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(
        data={
            "sub": str(staff.id),
            "user_type": "staff",
        }
    )

    return TokenResponse(
        access_token=access_token,
        role=staff.role.name,
        full_name=staff.full_name,
    )


@router.post(
    "/customer/register",
    response_model=CustomerTokenResponse,
    status_code=201,
)
def register_customer(
    payload: CustomerRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Register a new customer account and create the associated guest record.
    """

    email = payload.email.lower().strip()
    full_name = payload.full_name.strip()
    phone = payload.phone.strip()

    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Full name is required",
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number is required",
        )

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    existing_customer = (
        db.query(Customer)
        .filter(Customer.email == email)
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists",
        )

    existing_staff = (
        db.query(Staff)
        .filter(Staff.email == email)
        .first()
    )

    if existing_staff:
        raise HTTPException(
            status_code=400,
            detail="This email is already in use",
        )

    guest = Guest(
        full_name=full_name,
        email=email,
        phone=phone,
    )

    db.add(guest)
    db.flush()

    customer = Customer(
        guest_id=guest.id,
        email=email,
        password_hash=hash_password(payload.password),
        is_active=True,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    access_token = create_access_token(
        data={
            "sub": str(customer.id),
            "user_type": "customer",
        }
    )

    return CustomerTokenResponse(
        access_token=access_token,
        full_name=guest.full_name,
    )


@router.post(
    "/customer/login",
    response_model=CustomerTokenResponse,
)
def customer_login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Customer login.
    """

    email = payload.email.lower().strip()

    customer = (
        db.query(Customer)
        .filter(Customer.email == email)
        .first()
    )

    if not customer or not verify_password(
        payload.password,
        customer.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not customer.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled",
        )

    access_token = create_access_token(
        data={
            "sub": str(customer.id),
            "user_type": "customer",
        }
    )

    return CustomerTokenResponse(
        access_token=access_token,
        full_name=customer.guest.full_name,
    )