from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.staff import Staff
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Staff login. Verifies credentials and issues a JWT containing the
    staff id (sub) so downstream endpoints can enforce RBAC via require_role().
    """
    staff = db.query(Staff).filter(Staff.email == payload.email).first()

    if not staff or not verify_password(payload.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not staff.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(staff.id)})

    return TokenResponse(
        access_token=access_token,
        role=staff.role.name,
        full_name=staff.full_name,
    )
