"""
Run this once after creating the database (schema.sql) to populate
an initial Administrator account and some sample rooms.

Usage:
    python seed_data.py
"""

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.staff import Staff, Role
from app.models.room import Room, RoomType


db = SessionLocal()

try:
    # ROLES
    admin_role = (
        db.query(Role)
        .filter(Role.name == "Administrator")
        .first()
    )

    if not admin_role:
        admin_role = Role(name="Administrator")
        db.add(admin_role)
        db.flush()

    reception_role = (
        db.query(Role)
        .filter(Role.name == "Receptionist")
        .first()
    )

    if not reception_role:
        reception_role = Role(name="Receptionist")
        db.add(reception_role)
        db.flush()

    # DEFAULT ADMINISTRATOR ACCOUNT
    if not db.query(Staff).filter(
        Staff.email == "admin@sunbeamlodge.co.zm"
    ).first():

        admin = Staff(
            full_name="System Administrator",
            email="admin@sunbeamlodge.co.zm",
            password_hash=hash_password("ChangeMe123!"),
            role_id=admin_role.id,
        )

        db.add(admin)

    # SAMPLE ROOM TYPES
    if db.query(RoomType).count() == 0:

        types = [
            RoomType(
                name="Single",
                base_price=350.00,
                capacity=1,
                description="Standard single room"
            ),
            RoomType(
                name="Double",
                base_price=550.00,
                capacity=2,
                description="Double occupancy room"
            ),
            RoomType(
                name="Suite",
                base_price=950.00,
                capacity=3,
                description="Executive suite"
            ),
            RoomType(
                name="Conference",
                base_price=1500.00,
                capacity=30,
                description="Conference hall"
            ),
        ]

        db.add_all(types)
        db.flush()

        single = (
            db.query(RoomType)
            .filter(RoomType.name == "Single")
            .first()
        )

        double = (
            db.query(RoomType)
            .filter(RoomType.name == "Double")
            .first()
        )

        suite = (
            db.query(RoomType)
            .filter(RoomType.name == "Suite")
            .first()
        )

        # SAMPLE ROOMS
        rooms = [
            Room(
                room_number="101",
                room_type_id=single.id,
                floor="1"
            ),
            Room(
                room_number="102",
                room_type_id=single.id,
                floor="1"
            ),
            Room(
                room_number="103",
                room_type_id=double.id,
                floor="1"
            ),
            Room(
                room_number="201",
                room_type_id=double.id,
                floor="2"
            ),
            Room(
                room_number="202",
                room_type_id=suite.id,
                floor="2"
            ),
        ]

        db.add_all(rooms)

    db.commit()

    print(
        "Seed data inserted successfully."
    )
    print(
        "Admin login: "
        "admin@sunbeamlodge.co.zm / ChangeMe123!"
    )

finally:
    db.close()