import { useState, useMemo } from "react";

// ---------- Design tokens ----------
const colors = {
  bg: "#F7F4EC",
  panel: "#FFFFFF",
  nav: "#1B2A2F",
  navText: "#C9D2D0",
  navTextActive: "#FFFFFF",
  accent: "#C97A2B",
  accentDark: "#95591C",
  ink: "#1B2A2F",
  inkSoft: "#5B6B6E",
  border: "#E4E0D4",
  success: "#2F6E5C",
  successBg: "#E4F0EA",
  danger: "#8B3A3A",
  dangerBg: "#F5E7E4",
  info: "#3A5B99",
  infoBg: "#E7ECF5",
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "'Segoe UI', system-ui, sans-serif";

// ---------- Mock data (mirrors the real MySQL schema) ----------
const initialRoomTypes = [
  { id: 1, name: "Single", base_price: 350 },
  { id: 2, name: "Double", base_price: 550 },
  { id: 3, name: "Suite", base_price: 950 },
];

const initialRooms = [
  { id: 1, room_number: "101", room_type_id: 1, status: "available" },
  { id: 2, room_number: "102", room_type_id: 1, status: "occupied" },
  { id: 3, room_number: "103", room_type_id: 2, status: "available" },
  { id: 4, room_number: "201", room_type_id: 2, status: "available" },
  { id: 5, room_number: "202", room_type_id: 3, status: "maintenance" },
];

const initialGuests = [
  { id: 1, full_name: "Chola Mwape", phone: "+260 97 123 4567", email: "chola.m@example.com" },
  { id: 2, full_name: "James Banda", phone: "+260 96 765 4321", email: "j.banda@example.com" },
];

const initialReservations = [
  { id: 1, guest_id: 1, room_id: 2, check_in_date: "2026-09-03", check_out_date: "2026-09-06", status: "checked_in", total_amount: 1050 },
  { id: 2, guest_id: 2, room_id: 3, check_in_date: "2026-09-05", check_out_date: "2026-09-08", status: "booked", total_amount: 1650 },
];

const initialPayments = [
  { id: 1, reservation_id: 1, amount: 1050, method: "mobile_money", status: "paid" },
  { id: 2, reservation_id: 2, amount: 1650, method: "cash", status: "pending" },
];

const initialStaff = [
  { id: 1, full_name: "System Administrator", email: "admin@sunbeamlodge.co.zm", role: "Administrator" },
  { id: 2, full_name: "Mutinta Zulu", email: "m.zulu@sunbeamlodge.co.zm", role: "Receptionist" },
];

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

export default function App() {
  const [staff, setStaff] = useState(null); // { full_name, role }
  const [page, setPage] = useState("dashboard");

  const [rooms, setRooms] = useState(initialRooms);
  const [roomTypes] = useState(initialRoomTypes);
  const [guests, setGuests] = useState(initialGuests);
  const [reservations, setReservations] = useState(initialReservations);
  const [payments, setPayments] = useState(initialPayments);
  const [staffList, setStaffList] = useState(initialStaff);

  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showNewGuest, setShowNewGuest] = useState(false);
  const [showNewStaff, setShowNewStaff] = useState(false);

  const isAdmin = staff?.role === "Administrator";

  const roomLabel = (id) => rooms.find((r) => r.id === id)?.room_number || "\u2014";
  const guestLabel = (id) => guests.find((g) => g.id === id)?.full_name || "\u2014";
  const roomTypeLabel = (id) => roomTypes.find((t) => t.id === id)?.name || "\u2014";

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

  const addGuest = (guest) => {
    setGuests((prev) => [...prev, { ...guest, id: prev.length + 1 }]);
  };

  const addReservation = (res) => {
    setReservations((prev) => [...prev, { ...res, id: prev.length + 1, status: "booked" }]);
  };

  const addStaff = (member) => {
    setStaffList((prev) => [...prev, { ...member, id: prev.length + 1 }]);
  };

  if (!staff) {
    return <LoginScreen onLogin={setStaff} />;
  }

  return (
    <div style={{ display: "flex", minHeight: 600, fontFamily: sans, background: colors.bg }}>
      <Sidebar page={page} setPage={setPage} isAdmin={isAdmin} staff={staff} onLogout={() => setStaff(null)} />

      <div style={{ flex: 1, padding: "2rem 2.5rem", overflow: "auto" }}>
        {page === "dashboard" && (
          <Dashboard occupancy={occupancy} reservations={reservations} rooms={rooms} guestLabel={guestLabel} roomLabel={roomLabel} isAdmin={isAdmin} />
        )}

        {page === "reservations" && (
          <ReservationsPage
            reservations={reservations}
            guestLabel={guestLabel}
            roomLabel={roomLabel}
            onStatusChange={updateReservationStatus}
            onNew={() => setShowNewReservation(true)}
          />
        )}

        {page === "guests" && <GuestsPage guests={guests} onNew={() => setShowNewGuest(true)} />}

        {page === "rooms" && (
          <RoomsPage rooms={rooms} roomTypeLabel={roomTypeLabel} onStatusChange={updateRoomStatus} />
        )}

        {page === "payments" && (
          <PaymentsPage payments={payments} reservations={reservations} guestLabel={guestLabel} onStatusChange={updatePaymentStatus} />
        )}

        {page === "location" && <LocationPage />}

        {page === "reports" && isAdmin && (
          <ReportsPage reservations={reservations} rooms={rooms} roomTypes={roomTypes} roomTypeLabel={roomTypeLabel} roomLabel={roomLabel} payments={payments} />
        )}

        {page === "settings" && isAdmin && (
          <SettingsPage staffList={staffList} onNew={() => setShowNewStaff(true)} />
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

// ---------- Login ----------
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Receptionist");

  return (
    <div style={{ minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", background: colors.nav, fontFamily: sans }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onLogin({ full_name: name, role });
        }}
        style={{ background: colors.panel, padding: "2.5rem", borderRadius: 8, width: 340 }}
      >
        <h1 style={{ fontFamily: serif, fontSize: 26, margin: 0, color: colors.ink }}>SunBeam Lodge</h1>
        <p style={{ color: colors.inkSoft, marginTop: 4, marginBottom: 24, fontSize: 14 }}>Staff portal \u2014 prototype (mock data)</p>

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chanda Mulenga"
          style={{ width: "100%", padding: "0.6rem", marginBottom: 16, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", marginBottom: 20, border: `1px solid ${colors.border}`, borderRadius: 6 }}
        >
          <option>Receptionist</option>
          <option>Administrator</option>
        </select>

        <button
          type="submit"
          style={{ width: "100%", padding: "0.7rem", background: colors.accent, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
        >
          Sign in
        </button>
        <p style={{ fontSize: 12, color: colors.inkSoft, marginTop: 12 }}>
          Pick a role to see how RBAC changes what you can view \u2014 e.g. Reports and Settings only show for Administrator.
        </p>
      </form>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ page, setPage, isAdmin, staff, onLogout }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "reservations", label: "Reservations" },
    { id: "guests", label: "Guests" },
    { id: "rooms", label: "Rooms" },
    { id: "payments", label: "Payments" },
    { id: "location", label: "Lodge location" },
    ...(isAdmin ? [{ id: "reports", label: "Reports" }] : []),
    ...(isAdmin ? [{ id: "settings", label: "Staff & settings" }] : []),
  ];

  return (
    <div style={{ width: 220, background: colors.nav, color: colors.navText, padding: "1.5rem 0", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 1.5rem", marginBottom: 32 }}>
        <div style={{ fontFamily: serif, fontSize: 20, color: "#fff" }}>SunBeam</div>
        <div style={{ fontSize: 12, color: colors.navText }}>Lodge Management</div>
      </div>

      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          style={{
            textAlign: "left",
            padding: "0.7rem 1.5rem",
            background: page === item.id ? "rgba(255,255,255,0.08)" : "transparent",
            border: "none",
            borderLeft: page === item.id ? `3px solid ${colors.accent}` : "3px solid transparent",
            color: page === item.id ? colors.navTextActive : colors.navText,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}

      <div style={{ marginTop: "auto", padding: "0 1.5rem", fontSize: 12 }}>
        <div style={{ color: "#fff", marginBottom: 2 }}>{staff.full_name}</div>
        <div style={{ color: colors.navText, marginBottom: 12 }}>{staff.role}</div>
        <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${colors.navText}`, color: colors.navText, padding: "0.4rem 0.8rem", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>
          Log out
        </button>
      </div>
    </div>
  );
}

// ---------- Shared bits ----------
function PageTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 24, color: colors.ink, margin: 0 }}>{children}</h2>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ background: colors.accent, color: "#fff", border: "none", padding: "0.55rem 1.1rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const map = {
    booked: { bg: colors.infoBg, color: colors.info, label: "Booked" },
    checked_in: { bg: colors.successBg, color: colors.success, label: "Checked in" },
    checked_out: { bg: "#EDEBE3", color: colors.inkSoft, label: "Checked out" },
    cancelled: { bg: colors.dangerBg, color: colors.danger, label: "Cancelled" },
    available: { bg: colors.successBg, color: colors.success, label: "Available" },
    occupied: { bg: colors.infoBg, color: colors.info, label: "Occupied" },
    maintenance: { bg: colors.dangerBg, color: colors.danger, label: "Maintenance" },
    paid: { bg: colors.successBg, color: colors.success, label: "Paid" },
    pending: { bg: colors.infoBg, color: colors.info, label: "Pending" },
    refunded: { bg: colors.dangerBg, color: colors.danger, label: "Refunded" },
  };
  const s = map[status] || { bg: "#eee", color: "#555", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 999 }}>
      {s.label}
    </span>
  );
}

function Table({ headers, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", background: colors.panel, borderRadius: 8, overflow: "hidden", border: `1px solid ${colors.border}` }}>
      <thead>
        <tr style={{ background: "#F1EEE4" }}>
          {headers.map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "0.7rem 1rem", fontSize: 12, color: colors.inkSoft, fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const td = { padding: "0.7rem 1rem", fontSize: 13, color: colors.ink, borderBottom: `1px solid ${colors.border}` };

// ---------- Dashboard ----------
function Dashboard({ occupancy, reservations, rooms, guestLabel, roomLabel, isAdmin }) {
  const todaysCheckIns = reservations.filter((r) => r.status === "booked").length;
  return (
    <div>
      <PageTitle>Dashboard</PageTitle>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Total rooms" value={rooms.length} />
        <StatCard label="Occupied" value={occupancy.occupied} />
        {isAdmin && <StatCard label="Occupancy rate" value={`${occupancy.pct}%`} />}
        <StatCard label="Pending check-ins" value={todaysCheckIns} />
      </div>

      <h3 style={{ fontSize: 15, color: colors.ink, marginBottom: 10 }}>Recent reservations</h3>
      <Table headers={["Guest", "Room", "Check-in", "Check-out", "Status"]}>
        {reservations.map((r) => (
          <tr key={r.id}>
            <td style={td}>{guestLabel(r.guest_id)}</td>
            <td style={td}>{roomLabel(r.room_id)}</td>
            <td style={td}>{r.check_in_date}</td>
            <td style={td}>{r.check_out_date}</td>
            <td style={td}><StatusPill status={r.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "1rem 1.4rem", minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink }}>{value}</div>
      <div style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ---------- Reservations ----------
function ReservationsPage({ reservations, guestLabel, roomLabel, onStatusChange, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>New reservation</PrimaryButton>}>Reservations</PageTitle>

      <Table headers={["ID", "Guest", "Room", "Check-in", "Check-out", "Status", "Actions"]}>
        {reservations.map((r) => (
          <tr key={r.id}>
            <td style={td}>{r.id}</td>
            <td style={td}>{guestLabel(r.guest_id)}</td>
            <td style={td}>{roomLabel(r.room_id)}</td>
            <td style={td}>{r.check_in_date}</td>
            <td style={td}>{r.check_out_date}</td>
            <td style={td}><StatusPill status={r.status} /></td>
            <td style={td}>
              {r.status === "booked" && (
                <>
                  <ActionLink onClick={() => onStatusChange(r.id, "checked_in")}>Check in</ActionLink>{" "}
                  <ActionLink onClick={() => onStatusChange(r.id, "cancelled")} danger>Cancel</ActionLink>
                </>
              )}
              {r.status === "checked_in" && <ActionLink onClick={() => onStatusChange(r.id, "checked_out")}>Check out</ActionLink>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function ActionLink({ children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: danger ? colors.danger : colors.accentDark, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>
      {children}
    </button>
  );
}

// ---------- Guests ----------
function GuestsPage({ guests, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>Add guest</PrimaryButton>}>Guests</PageTitle>
      <Table headers={["Name", "Phone", "Email"]}>
        {guests.map((g) => (
          <tr key={g.id}>
            <td style={td}>{g.full_name}</td>
            <td style={td}>{g.phone}</td>
            <td style={td}>{g.email}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------- Rooms ----------
function RoomsPage({ rooms, roomTypeLabel, onStatusChange }) {
  return (
    <div>
      <PageTitle>Rooms</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        Room status updates automatically on check-in/check-out \u2014 you can also set maintenance manually here.
      </p>
      <Table headers={["Room", "Type", "Status", "Actions"]}>
        {rooms.map((r) => (
          <tr key={r.id}>
            <td style={td}>{r.room_number}</td>
            <td style={td}>{roomTypeLabel(r.room_type_id)}</td>
            <td style={td}><StatusPill status={r.status} /></td>
            <td style={td}>
              {r.status !== "maintenance" ? (
                <ActionLink onClick={() => onStatusChange(r.id, "maintenance")} danger>Mark maintenance</ActionLink>
              ) : (
                <ActionLink onClick={() => onStatusChange(r.id, "available")}>Mark available</ActionLink>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------- Payments ----------
function PaymentsPage({ payments, reservations, guestLabel, onStatusChange }) {
  const guestForPayment = (reservationId) => {
    const res = reservations.find((r) => r.id === reservationId);
    return res ? guestLabel(res.guest_id) : "\u2014";
  };

  return (
    <div>
      <PageTitle>Payments</PageTitle>
      <Table headers={["Reservation", "Guest", "Amount (ZMW)", "Method", "Status", "Actions"]}>
        {payments.map((p) => (
          <tr key={p.id}>
            <td style={td}>#{p.reservation_id}</td>
            <td style={td}>{guestForPayment(p.reservation_id)}</td>
            <td style={td}>{p.amount.toLocaleString()}</td>
            <td style={td} className="capitalize">{p.method.replace("_", " ")}</td>
            <td style={td}><StatusPill status={p.status} /></td>
            <td style={td}>
              {p.status === "pending" && <ActionLink onClick={() => onStatusChange(p.id, "paid")}>Mark paid</ActionLink>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------- Lodge location (Geolocation module) ----------
function LocationPage() {
  return (
    <div>
      <PageTitle>Lodge location</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        Visual placeholder for the Google Maps integration described in your proposal \u2014 not functional yet, this is where the embedded map and directions widget will sit.
      </p>
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ height: 220, background: "#E4E0D4", display: "flex", alignItems: "center", justifyContent: "center", color: colors.inkSoft, fontSize: 13 }}>
          Map embed placeholder (Google Maps API)
        </div>
        <div style={{ padding: "1rem 1.25rem" }}>
          <div style={{ fontWeight: 600, color: colors.ink, marginBottom: 4 }}>SunBeam Lodge</div>
          <div style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 10 }}>Masaiti District, Copperbelt Province, Zambia</div>
          <button disabled style={{ background: colors.border, color: colors.inkSoft, border: "none", padding: "0.5rem 1rem", borderRadius: 6, fontSize: 13, cursor: "not-allowed" }}>
            Get directions (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Reports (admin only) ----------
function ReportsPage({ reservations, rooms, roomTypeLabel, roomLabel, payments }) {
  const bookingsByRoom = useMemo(() => {
    const counts = {};
    reservations.forEach((r) => {
      if (r.status !== "cancelled") counts[r.room_id] = (counts[r.room_id] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [reservations]);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <PageTitle>Reports</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 20 }}>
        Visible only because you're logged in as Administrator \u2014 this mirrors the RBAC rule in the real backend.
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard label="Revenue collected (ZMW)" value={totalRevenue.toLocaleString()} />
        <StatCard label="Pending payments" value={payments.filter((p) => p.status === "pending").length} />
      </div>

      <h3 style={{ fontSize: 15, color: colors.ink, marginBottom: 10 }}>Most-booked rooms</h3>
      <Table headers={["Room", "Type", "Bookings"]}>
        {bookingsByRoom.map(([roomId, count]) => {
          const room = rooms.find((r) => r.id === Number(roomId));
          return (
            <tr key={roomId}>
              <td style={td}>{roomLabel(Number(roomId))}</td>
              <td style={td}>{room ? roomTypeLabel(room.room_type_id) : "\u2014"}</td>
              <td style={td}>{count}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

// ---------- Settings / staff (admin only) ----------
function SettingsPage({ staffList, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>Add staff account</PrimaryButton>}>Staff & settings</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        This is where Administrator-only account management lives \u2014 matches the "change system settings" use case.
      </p>
      <Table headers={["Name", "Email", "Role"]}>
        {staffList.map((s) => (
          <tr key={s.id}>
            <td style={td}>{s.full_name}</td>
            <td style={td}>{s.email}</td>
            <td style={td}>{s.role}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------- Modals ----------
function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,47,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div style={{ background: colors.panel, borderRadius: 8, padding: "1.5rem 1.75rem", width: 380, maxWidth: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: serif, fontSize: 18, margin: 0, color: colors.ink }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.inkSoft }}>\u00d7</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "0.55rem", marginBottom: 14, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box", fontSize: 13 };
const labelStyle = { display: "block", fontSize: 12, marginBottom: 5, color: colors.ink, fontWeight: 600 };

function NewGuestModal({ onClose, onCreate }) {
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <ModalShell title="Add guest" onClose={onClose}>
      <label style={labelStyle}>Full name</label>
      <input style={inputStyle} value={full_name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mutinta Zulu" />
      <label style={labelStyle}>Phone</label>
      <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+260 ..." />
      <label style={labelStyle}>Email (optional)</label>
      <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      {error && <div style={{ color: colors.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton
        onClick={() => {
          if (!full_name.trim() || !phone.trim()) {
            setError("Name and phone are required.");
            return;
          }
          onCreate({ full_name, phone, email });
        }}
      >
        Save guest
      </PrimaryButton>
    </ModalShell>
  );
}

function NewStaffModal({ onClose, onCreate }) {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Receptionist");
  const [error, setError] = useState("");

  return (
    <ModalShell title="Add staff account" onClose={onClose}>
      <label style={labelStyle}>Full name</label>
      <input style={inputStyle} value={full_name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bwalya Chibale" />
      <label style={labelStyle}>Email</label>
      <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@sunbeamlodge.co.zm" />
      <label style={labelStyle}>Role</label>
      <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Receptionist</option>
        <option>Administrator</option>
      </select>
      {error && <div style={{ color: colors.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton
        onClick={() => {
          if (!full_name.trim() || !email.trim()) {
            setError("Name and email are required.");
            return;
          }
          onCreate({ full_name, email, role });
        }}
      >
        Save staff account
      </PrimaryButton>
    </ModalShell>
  );
}

function NewReservationModal({ rooms, guests, reservations, roomTypeLabel, onClose, onCreate }) {
  const [guest_id, setGuestId] = useState(guests[0]?.id || "");
  const [room_id, setRoomId] = useState(rooms[0]?.id || "");
  const [check_in_date, setCheckIn] = useState("");
  const [check_out_date, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!guest_id || !room_id || !check_in_date || !check_out_date) {
      setError("All fields are required.");
      return;
    }
    if (new Date(check_out_date) <= new Date(check_in_date)) {
      setError("Check-out must be after check-in.");
      return;
    }
    const conflict = reservations.some(
      (r) => r.room_id === Number(room_id) && r.status !== "cancelled" && overlaps(check_in_date, check_out_date, r.check_in_date, r.check_out_date)
    );
    if (conflict) {
      setError("This room is already booked for an overlapping date range.");
      return;
    }
    onCreate({ guest_id: Number(guest_id), room_id: Number(room_id), check_in_date, check_out_date });
  };

  return (
    <ModalShell title="New reservation" onClose={onClose}>
      <label style={labelStyle}>Guest</label>
      <select style={inputStyle} value={guest_id} onChange={(e) => setGuestId(e.target.value)}>
        {guests.map((g) => (
          <option key={g.id} value={g.id}>{g.full_name}</option>
        ))}
      </select>

      <label style={labelStyle}>Room</label>
      <select style={inputStyle} value={room_id} onChange={(e) => setRoomId(e.target.value)}>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>{r.room_number} \u2014 {roomTypeLabel(r.room_type_id)}</option>
        ))}
      </select>

      <label style={labelStyle}>Check-in</label>
      <input style={inputStyle} type="date" value={check_in_date} onChange={(e) => setCheckIn(e.target.value)} />

      <label style={labelStyle}>Check-out</label>
      <input style={inputStyle} type="date" value={check_out_date} onChange={(e) => setCheckOut(e.target.value)} />

      {error && <div style={{ color: colors.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton onClick={submit}>Create reservation</PrimaryButton>
    </ModalShell>
  );
}
