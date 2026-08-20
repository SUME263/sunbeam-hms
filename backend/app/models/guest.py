from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=False)
    id_number = Column(String(50), nullable=True)
    nationality = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    reservations = relationship("Reservation", back_populates="guest")
