from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.core.database import get_db
from app.models.staff import Staff
from app.models.customer import Customer

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-fallback-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

customer_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/customer/login",
     scheme_name="CustomerOAuth2PasswordBearer"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_staff(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Staff:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id: str = payload.get("sub")
        if staff_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    staff = db.query(Staff).filter(Staff.id == int(staff_id)).first()
    if staff is None or not staff.is_active:
        raise credentials_exception
    return staff

def get_current_customer(
    token: str = Depends(customer_oauth2_scheme),
    db: Session = Depends(get_db)
) -> Customer:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate customer credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_type = payload.get("user_type")
        customer_id = payload.get("sub")

        if user_type != "customer" or customer_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    customer = (
        db.query(Customer)
        .filter(Customer.id == int(customer_id))
        .first()
    )

    if customer is None or not customer.is_active:
        raise credentials_exception

    return customer

def require_role(*allowed_roles: str):
    def role_checker(current_staff: Staff = Depends(get_current_staff)) -> Staff:
        if current_staff.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {allowed_roles}",
            )
        return current_staff
    return role_checker
