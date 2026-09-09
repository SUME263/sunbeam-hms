import { colors, serif } from "../theme";

export default function Sidebar({ page, setPage, isAdmin, staff, onLogout }) {
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
        <button
          onClick={onLogout}
          style={{ background: "transparent", border: `1px solid ${colors.navText}`, color: colors.navText, padding: "0.4rem 0.8rem", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
