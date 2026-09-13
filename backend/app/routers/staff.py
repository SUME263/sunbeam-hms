from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_staff, require_role, hash_password
from app.models.staff import Staff, Role


router = APIRouter(
    prefix="/staff",
    tags=["Staff"]
)


class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class StaffOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class StaffStatusUpdate(BaseModel):
    is_active: bool


def staff_response(staff):
    return {
        "id": staff.id,
        "full_name": staff.full_name,
        "email": staff.email,
        "role": staff.role.name,
        "is_active": staff.is_active,
    }


@router.get("", response_model=list[StaffOut])
def list_staff(
    db: Session = Depends(get_db),
    current_staff=Depends(require_role("Administrator"))
):
    staff_members = (
        db.query(Staff)
        .order_by(Staff.full_name.asc())
        .all()
    )

    return [staff_response(staff) for staff in staff_members]


@router.get("/{staff_id}", response_model=StaffOut)
def get_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_staff=Depends(require_role("Administrator"))
):
    staff = (
        db.query(Staff)
        .filter(Staff.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found."
        )

    return staff_response(staff)


@router.post("", response_model=StaffOut, status_code=201)
def create_staff(
    payload: StaffCreate,
    db: Session = Depends(get_db),
    current_staff=Depends(require_role("Administrator"))
):
    existing = (
        db.query(Staff)
        .filter(Staff.email == payload.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A staff account with this email already exists."
        )

    role = (
        db.query(Role)
        .filter(Role.name == payload.role)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=400,
            detail="Invalid staff role."
        )

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )

    staff = Staff(
        full_name=payload.full_name.strip(),
        email=payload.email,
        password_hash=hash_password(payload.password),
        role_id=role.id,
        is_active=True
    )

    db.add(staff)
    db.commit()
    db.refresh(staff)

    return staff_response(staff)


@router.patch("/{staff_id}/status", response_model=StaffOut)
def update_staff_status(
    staff_id: int,
    payload: StaffStatusUpdate,
    db: Session = Depends(get_db),
    current_staff=Depends(require_role("Administrator"))
):
    staff = (
        db.query(Staff)
        .filter(Staff.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found."
        )

    if staff.id == current_staff.id and not payload.is_active:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account."
        )

    staff.is_active = payload.is_active

    db.commit()
    db.refresh(staff)

    return staff_response(staff)