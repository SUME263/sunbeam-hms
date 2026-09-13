from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, reservations, reports, guests, rooms, staff

app = FastAPI(
    title="SunBeam Lodge Hotel Management System API",
    description="Backend for COMP1682 Computing Project - Nathan Chellah",
    version="0.1.0",
)

# Allow the React frontend (running on a different port during development) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reservations.router)
app.include_router(reports.router)
app.include_router(guests.router)
app.include_router(rooms.router)
app.include_router(staff.router)


@app.get("/")
def health_check():
    return {"status": "SunBeam Lodge HMS API is running"}
