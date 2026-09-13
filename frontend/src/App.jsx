import {
  createGuest,
  listGuests,
  listRooms,
  createRoom,
  updateRoomStatus as updateRoomStatusApi,
  listStaff,
  createStaff,
  updateStaffStatus as updateStaffStatusApi,
  listReservations,
  createReservation,
  checkIn,
  checkOut,
  cancelReservation,
} from "./services/api";

// import { createGuest, listGuests, listRooms, createRoom, updateRoomStatus as updateRoomStatusApi, listStaff, createStaff, updateStaffStaus as updateStaffStatusApi } from "./services/api";

import { useState, useMemo, useEffect } from "react";
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
import NewRoomModal from "./components/modals/NewRoomModal";

export default function App() {
  const [staff, setStaff] = useState(null); // { full_name, role }
  // the one above will have to be removed or edited but keep it there now 
  const [page, setPage] = useState("dashboard");

  const [rooms, setRooms] = useState([]);
  // this will have to be changed later on as well 
  const [roomTypes] = useState(initialRoomTypes);

  const [guests, setGuests] = useState([]);

  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState(initialPayments);
  const [staffList, setStaffList] = useState([]);

  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showNewGuest, setShowNewGuest] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
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

  //function updated
  const updateRoomStatus = async (id, status) => {
  try {
    const response = await updateRoomStatusApi(id, status);

    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? response.data : room
      )
    );
  } catch (error) {
    console.error("Failed to update room status:", error);

    alert(
      error.response?.data?.detail ||
      "Unable to update room status."
    );
  }
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

//loading rooms
const loadRooms = async () => {
  try {
    const response = await listRooms();
    setRooms(response.data);
  } catch (error) {
    console.error("Failed to load rooms:", error);
  }
};

//load reservations
const loadReservations = async () => {
  try {
    const response = await listReservations();
    setReservations(response.data);
  } catch (error) {
    console.error("Failed to load reservations:", error);
  }
};


useEffect(() => {
  if (!staff) return;

  loadGuests();
  loadRooms();
  loadReservations();

  if (isAdmin) {
    loadStaff();
  }
}, [staff, isAdmin]);


  // const addGuest = (guest) => setGuests((prev) => [...prev, { ...guest, id: prev.length + 1 }]);
  // above has been replaced with the below 
  const addGuest = async (guest) => {
  try {
      const response = await createGuest(guest);

      setGuests((prev) => [...prev, response.data]);
      setShowNewGuest(false);
    } catch (error) {
      console.error("Failed to create guest:", error);

      alert(
        error.response?.data?.detail ||
        "Unable to create guest."
      );
    }
};



const addRoom = async (room) => {
  try {
    const response = await createRoom(room);

    setRooms((prev) => [
      ...prev,
      response.data
    ]);

    setShowNewRoom(false);
  } catch (error) {
    console.error("Failed to create room:", error);

    alert(
      error.response?.data?.detail ||
      "Unable to create room."
    );
  }
};

const loadStaff = async () => {
  try {
    const response = await listStaff();
    setStaffList(response.data);
  } catch (error) {
    console.error(
      "Failed to load staff:",
      error
    );
  }
};


const updateStaffStatus = async (
  id,
  is_active
) => {
  try {
    const response =
      await updateStaffStatusApi(
        id,
        is_active
      );

    setStaffList((prev) =>
      prev.map((member) =>
        member.id === id
          ? response.data
          : member
      )
    );
  } catch (error) {
    console.error(
      "Failed to update staff status:",
      error
    );

    alert(
      error.response?.data?.detail ||
      "Unable to update staff status."
    );
  }
};

//reservation function
 const addReservation = async (reservation) => {
  try {
    const response = await createReservation(reservation);

    setReservations((prev) => [
      ...prev,
      response.data
    ]);
  } catch (error) {
    console.error("Failed to create reservation:", error);

    alert(
      error.response?.data?.detail ||
      "Unable to create reservation."
    );
  }
};
  
  // staff function
  const addStaff = async (member) => {
    try {
      const response = await createStaff(member);

      setStaffList((prev) => [
        ...prev,
        response.data
      ]);

      setShowNewStaff(false);
    } catch (error) {
      console.error(
        "Failed to create staff account:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to create staff account."
      );
    }
  };

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

        {/* need to properly format everything once complete */}
       {page === "rooms" && (
          <Rooms
            rooms={rooms}
            roomTypes={roomTypes}
            onNew={() => setShowNewRoom(true)}
            onStatusChange={updateRoomStatus}
          />
        )}

        {page === "payments" && (
          <Payments payments={payments} reservations={reservations} guestLabel={guestLabel} onStatusChange={updatePaymentStatus} />
        )}

        {page === "location" && <Location />}

        {page === "reports" && isAdmin && (
          <Reports reservations={reservations} rooms={rooms} roomTypes={roomTypes} roomTypeLabel={roomTypeLabel} roomLabel={roomLabel} payments={payments} />
        )}

        {page === "settings" && isAdmin && (
          <Settings
            staffList={staffList}
            onNew={() => setShowNewStaff(true)}
            onStatusChange={updateStaffStatus}
          />
        )}
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

      {showNewRoom && (
        <NewRoomModal
          roomTypes={roomTypes}
          onClose={() => setShowNewRoom(false)}
          onCreate={addRoom}
        />
      )}


      {showNewStaff && (
        <NewStaffModal
          onClose={() => setShowNewStaff(false)}
          onCreate={addStaff}
        />
      )}
    </div>
  );
}
