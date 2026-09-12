import { listGuests, createGuest } from "./services/api";
import { createGuest, listGuests } from "./services/api";
import { useState, useMemo } from "react";
import { sans, colors } from "./theme";
import { initialRoomTypes, initialRooms, initialGuests, initialReservations, initialPayments, initialStaff } from "./mockData";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Guests from "./pages/Guests";
import Rooms from "./pages/Rooms";
import Payments from "./pages/Payments";
import Location from "./pages/Location";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import NewReservationModal from "./components/modals/NewReservationModal";
import NewGuestModal from "./components/modals/NewGuestModal";
import NewStaffModal from "./components/modals/NewStaffModal";

export default function App() {
  const [staff, setStaff] = useState(null); // { full_name, role }
  const [page, setPage] = useState("dashboard");

  const [rooms, setRooms] = useState(initialRooms);
  const [roomTypes] = useState(initialRoomTypes);
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState(initialReservations);
  const [payments, setPayments] = useState(initialPayments);
  const [staffList, setStaffList] = useState(initialStaff);

  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showNewGuest, setShowNewGuest] = useState(false);
  const [showNewStaff, setShowNewStaff] = useState(false);

  const isAdmin = staff?.role === "Administrator";

  const roomLabel = (id) => rooms.find((r) => r.id === id)?.room_number || "—";
  const guestLabel = (id) => guests.find((g) => g.id === id)?.full_name || "—";
  const roomTypeLabel = (id) => roomTypes.find((t) => t.id === id)?.name || "—";

  const occupancy = useMemo(() => {
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    return { total: rooms.length, occupied, pct: Math.round((occupied / rooms.length) * 100) };
  }, [rooms]);

  const updateReservationStatus = (id, status) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updateRoomStatus = (id, status) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updatePaymentStatus = (id, status) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };



  // need to check placement 
  const loadGuests = async () => {
  try {
    const response = await listGuests();
    setGuests(response.data);
  } catch (error) {
    console.error("Failed to load guests:", error);
  }
};

  const addGuest = (guest) => setGuests((prev) => [...prev, { ...guest, id: prev.length + 1 }]);
  const addReservation = (res) => setReservations((prev) => [...prev, { ...res, id: prev.length + 1, status: "booked" }]);
  const addStaff = (member) => setStaffList((prev) => [...prev, { ...member, id: prev.length + 1 }]);

  if (!staff) {
    return <Login onLogin={setStaff} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: sans, background: colors.bg }}>
      <Sidebar page={page} setPage={setPage} isAdmin={isAdmin} staff={staff} onLogout={() => setStaff(null)} />

      <div style={{ flex: 1, padding: "2rem 2.5rem", overflow: "auto" }}>
        {page === "dashboard" && (
          <Dashboard occupancy={occupancy} reservations={reservations} rooms={rooms} guestLabel={guestLabel} roomLabel={roomLabel} isAdmin={isAdmin} />
        )}

        {page === "reservations" && (
          <Reservations
            reservations={reservations}
            guestLabel={guestLabel}
            roomLabel={roomLabel}
            onStatusChange={updateReservationStatus}
            onNew={() => setShowNewReservation(true)}
          />
        )}

        {page === "guests" && <Guests guests={guests} onNew={() => setShowNewGuest(true)} />}

        {page === "rooms" && <Rooms rooms={rooms} roomTypeLabel={roomTypeLabel} onStatusChange={updateRoomStatus} />}

        {page === "payments" && (
          <Payments payments={payments} reservations={reservations} guestLabel={guestLabel} onStatusChange={updatePaymentStatus} />
        )}

        {page === "location" && <Location />}

        {page === "reports" && isAdmin && (
          <Reports reservations={reservations} rooms={rooms} roomTypes={roomTypes} roomTypeLabel={roomTypeLabel} roomLabel={roomLabel} payments={payments} />
        )}

        {page === "settings" && isAdmin && <Settings staffList={staffList} onNew={() => setShowNewStaff(true)} />}
      </div>

      {showNewReservation && (
        <NewReservationModal
          rooms={rooms}
          guests={guests}
          reservations={reservations}
          roomTypeLabel={roomTypeLabel}
          onClose={() => setShowNewReservation(false)}
          onCreate={(res) => {
            addReservation(res);
            setShowNewReservation(false);
          }}
        />
      )}

      {showNewGuest && (
        <NewGuestModal
          onClose={() => setShowNewGuest(false)}
          onCreate={(g) => {
            addGuest(g);
            setShowNewGuest(false);
          }}
        />
      )}

      {showNewStaff && (
        <NewStaffModal
          onClose={() => setShowNewStaff(false)}
          onCreate={(s) => {
            addStaff(s);
            setShowNewStaff(false);
          }}
        />
      )}
    </div>
  );
}
