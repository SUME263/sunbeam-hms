import { useState, useMemo, useEffect } from "react";
import { sans, colors } from "./theme";

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
   listPayments,
  createPayment,
  markPaymentPaid,
  refundPayment,
  getRevenueReport,
  getOccupancyReport,
} from "./services/api";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import CustomerLogin from "./pages/CustomerLogin";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Guests from "./pages/Guests";
import Rooms from "./pages/Rooms";
import Payments from "./pages/Payments";
import Location from "./pages/Location";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerRegister from "./pages/CustomerRegister";

import NewReservationModal from "./components/modals/NewReservationModal";
import NewGuestModal from "./components/modals/NewGuestModal";
import NewStaffModal from "./components/modals/NewStaffModal";
import NewRoomModal from "./components/modals/NewRoomModal";

import { initialRoomTypes, initialPayments } from "./mockData";

export default function App() {
  // Logged-in staff member
  const [staff, setStaff] = useState(() => {
  const savedStaff = localStorage.getItem("staff");
  return savedStaff
    ? JSON.parse(savedStaff)
    : null;
  });

  // currently logged in customer
  const [customer, setCustomer] = useState(() => {
  const savedCustomer = localStorage.getItem("customer");
  return savedCustomer ? JSON.parse(savedCustomer) : null;
  });

  // Current page
  const [page, setPage] = useState("dashboard");

  // customer page
  const [customerPortal, setCustomerPortal] = useState(false);

  // Backend data
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Still using mock data for these for now
  const [roomTypes] = useState(initialRoomTypes);
  
  const [payments, setPayments] = useState([]);

  // reports
  const [revenueReport, setRevenueReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);

  // Modal states
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showNewGuest, setShowNewGuest] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [showNewStaff, setShowNewStaff] = useState(false);

  // Check whether logged-in user is an administrator
  const isAdmin = staff?.role === "Administrator";
 
// helper functions to get labels 
  const roomLabel = (id) =>
    rooms.find((room) => room.id === id)?.room_number || "—";

  const guestLabel = (id) =>
    guests.find((guest) => guest.id === id)?.full_name || "—";

  const roomTypeLabel = (id) =>
    roomTypes.find((type) => type.id === id)?.name || "—";

  const occupancy = useMemo(() => {
    const occupied = rooms.filter(
      (room) => room.status === "occupied"
    ).length;

    return {
      total: rooms.length,
      occupied,
      pct: rooms.length
        ? Math.round((occupied / rooms.length) * 100)
        : 0,
    };
  }, [rooms]);

  const loadGuests = async () => {
    try {
      const response = await listGuests();
      setGuests(response.data);
    } catch (error) {
      console.error("Failed to load guests:", error);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await listRooms();
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await listReservations();
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to load reservations:", error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await listStaff();
      setStaffList(response.data);
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  const loadPayments = async () => {
  try {
    const response = await listPayments();
    setPayments(response.data);
  } catch (error) {
    console.error("Failed to load payments:", error);
  }
};

// load reports
const loadReports = async (startDate = null, endDate = null) => {
  try {
    const today = new Date();

    const start =
      startDate ||
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-01`;

    const end =
      endDate ||
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(
        new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate()
      ).padStart(2, "0")}`;

    const [revenueResponse, occupancyResponse] =
      await Promise.all([
        getRevenueReport(start, end),
        getOccupancyReport(),
      ]);

    setRevenueReport(revenueResponse.data);
    setOccupancyReport(occupancyResponse.data);
  } catch (error) {
    console.error("Failed to load reports:", error);
  }
};

// Load backend data after login
useEffect(() => {
  if (!staff) return;

  loadGuests();
  loadRooms();
  loadReservations();
  loadPayments();
  loadReports();

  if (isAdmin) {
    loadStaff();
  }
}, [staff, isAdmin]);

  // Guest management
  const addGuest = async (guest) => {
    try {
      const response = await createGuest(guest);

      setGuests((prev) => [
        ...prev,
        response.data,
      ]);

      setShowNewGuest(false);
    } catch (error) {
      console.error("Failed to create guest:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to create guest."
      );
    }
  };

  // Room management
  const addRoom = async (room) => {
    try {
      const response = await createRoom(room);

      setRooms((prev) => [
        ...prev,
        response.data,
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

  const updateRoomStatus = async (id, status) => {
    try {
      const response = await updateRoomStatusApi(
        id,
        status
      );

      setRooms((prev) =>
        prev.map((room) =>
          room.id === id
            ? response.data
            : room
        )
      );
    } catch (error) {
      console.error(
        "Failed to update room status:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to update room status."
      );
    }
  };
 
  // Staff management
  const addStaff = async (member) => {
    try {
      const response = await createStaff(member);

      setStaffList((prev) => [
        ...prev,
        response.data,
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

// Payment management
const updatePaymentStatus = async (id, status) => {
  try {
    let response;

    if (status === "paid") {
      response = await markPaymentPaid(id);
    }

    if (status === "refunded") {
      response = await refundPayment(id);
    }

    if (!response) return;

    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id ? response.data : payment
      )
    );
  } catch (error) {
    console.error("Failed to update payment status:", error);

    alert(
      error.response?.data?.detail ||
        "Unable to update payment."
    );
  }
};

   const addPayment = async (payment) => {
  try {
    const response = await createPayment(payment);

    setPayments((prev) => [response.data, ...prev]);

    return response.data;
  } catch (error) {
    console.error("Failed to create payment:", error);
    throw error;
  }
};

  // Reservation management
  const addReservation = async (reservation) => {
    try {
      const response =
        await createReservation(reservation);

      setReservations((prev) => [
        ...prev,
        response.data,
      ]);

      return response.data;
    } catch (error) {
      console.error(
        "Failed to create reservation:",
        error
      );

      // Let the modal handle the error
      throw error;
    }
  };

  const updateReservationStatus = async (
    id,
    status
  ) => {
    try {
      let response;

      if (status === "checked_in") {
        response = await checkIn(id);
      }

      if (status === "checked_out") {
        response = await checkOut(id);
      }

      if (status === "cancelled") {
        response = await cancelReservation(id);
      }

      if (!response) {
        return;
      }

      // Update reservation using the response
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id
            ? response.data
            : reservation
        )
      );

      // Refresh rooms because check in check-out can change room status
      if (
        status === "checked_in" ||
        status === "checked_out"
      ) {
        await loadRooms();
      }
    } catch (error) {
      console.error(
        "Failed to update reservation status:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to update reservation."
      );
    }
  };

  // Customer login screen, temp welcome screen because customer login keeps reloading to staff page
  // Customer registration screen
if (customerPortal && page === "customer-register") {
  return (
    <CustomerRegister
      onRegister={(registeredCustomer) => {
        setCustomer(registeredCustomer);
        setPage("dashboard");
      }}
      onLogin={() => {
        setPage("customer-login");
      }}
    />
  );
}

// Customer login and dashboard
if (customerPortal) {
  if (!customer) {
    return (
      <CustomerLogin
        onLogin={(loggedInCustomer) => {
          setCustomer(loggedInCustomer);
          setPage("dashboard");
        }}
        onRegister={() => {
          setPage("customer-register");
        }}
      />
    );
  }

  return (
    <CustomerDashboard
      customer={customer}
      onSignOut={() => {
        localStorage.removeItem("customer_access_token");
        localStorage.removeItem("customer");

        setCustomer(null);
        setCustomerPortal(false);
        setPage("dashboard");
      }}
    />
  );
}

  // Staff login screen
  if (!staff) {
    return (
      <Login
        onLogin={setStaff}
        onCustomerLogin={() => {
          setCustomerPortal(true);
          setPage("customer-login");
        }}
      />
    );
  }

// main app
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: sans,
        background: colors.bg,
      }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        isAdmin={isAdmin}
        staff={staff}
        onLogout={() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("staff");
          setStaff(null);
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "2rem 2.5rem",
          overflow: "auto",
        }}
      >
        {/* Dashboard */}
        {page === "dashboard" && (
          <Dashboard
            occupancyReport={occupancyReport}
            reservations={reservations}
            rooms={rooms}
            guestLabel={guestLabel}
            roomLabel={roomLabel}
            isAdmin={isAdmin}
            revenueReport={revenueReport}
          />
        )}

        {/* Reservations */}
        {page === "reservations" && (
          <Reservations
            reservations={reservations}
            guestLabel={guestLabel}
            roomLabel={roomLabel}
            onStatusChange={updateReservationStatus}
            onNew={() =>
              setShowNewReservation(true)
            }
          />
        )}

        {/* Guests */}
        {page === "guests" && (
          <Guests
            guests={guests}
            onNew={() => setShowNewGuest(true)}
          />
        )}

        {/* Rooms */}
        {page === "rooms" && (
          <Rooms
            rooms={rooms}
            roomTypes={roomTypes}
            onNew={() => setShowNewRoom(true)}
            onStatusChange={updateRoomStatus}
          />
        )}

        {/* Payments */}
        {page === "payments" && (
          <Payments
            payments={payments}
            reservations={reservations}
            guestLabel={guestLabel}
            onStatusChange={updatePaymentStatus}
            onCreate={addPayment}
          />
        )}

        {/* Location */}
        {page === "location" && <Location />}

        {/* Reports */}
        {page === "reports" && isAdmin && (
          <Reports
            reservations={reservations}
            rooms={rooms}
            roomTypes={roomTypes}
            roomTypeLabel={roomTypeLabel}
            roomLabel={roomLabel}
            payments={payments}
            revenueReport={revenueReport}
            occupancyReport={occupancyReport}
            onLoadRevenueReport={loadReports}
          />
        )}

        {/* Settings */}
        {page === "settings" && isAdmin && (
          <Settings
            staffList={staffList}
            onNew={() =>
              setShowNewStaff(true)
            }
            onStatusChange={updateStaffStatus}
          />
        )}
      </div>

      {/*New Reservation Modal */}

      {showNewReservation && (
        <NewReservationModal
          rooms={rooms}
          guests={guests}
          reservations={reservations}
          roomTypeLabel={roomTypeLabel}
          onClose={() =>
            setShowNewReservation(false)
          }
          onCreate={async (reservation) => {
            await addReservation(reservation);
            setShowNewReservation(false);
          }}
        />
      )}

      {/* New Guest Modal */}
      {showNewGuest && (
        <NewGuestModal
          onClose={() =>
            setShowNewGuest(false)
          }
          onCreate={addGuest}
        />
      )}

      {/* New Room Modal*/}

      {showNewRoom && (
        <NewRoomModal
          roomTypes={roomTypes}
          onClose={() =>
            setShowNewRoom(false)
          }
          onCreate={addRoom}
        />
      )}

      {/*New Staff Modal*/}

      {showNewStaff && (
        <NewStaffModal
          onClose={() =>
            setShowNewStaff(false)
          }
          onCreate={addStaff}
        />
      )}
    </div>
  );
}