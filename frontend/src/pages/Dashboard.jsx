import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import {
  listReservations,
  checkIn,
  checkOut,
  cancelReservation,
  getOccupancyReport,
} from "../services/api";

export default function Dashboard() {
  const { staff, logout, isAdmin } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const res = await listReservations();
      setReservations(res.data);
    } catch (e) {
      setErrorMsg("Could not load reservations.");
    }

    if (isAdmin) {
      try {
        const occ = await getOccupancyReport();
        setOccupancy(occ.data);
      } catch (e) {
        // Non-admins will 403 here, which is expected RBAC behaviour
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (action, id) => {
    try {
      if (action === "check-in") await checkIn(id);
      if (action === "check-out") await checkOut(id);
      if (action === "cancel") await cancelReservation(id);
      loadData();
    } catch (e) {
      setErrorMsg(e.response?.data?.detail || "Action failed.");
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>SunBeam Lodge</h2>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
            {staff?.full_name} · {staff?.role}
          </span>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>
          Log out
        </button>
      </header>

      {isAdmin && occupancy && (
        <div style={styles.statsRow}>
          <StatCard label="Total Rooms" value={occupancy.total_rooms} />
          <StatCard label="Occupied" value={occupancy.occupied_rooms} />
          <StatCard label="Occupancy Rate" value={`${occupancy.occupancy_rate_pct}%`} />
        </div>
      )}

      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      <h3>Reservations</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Room</th>
            <th>Guest</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.room_id}</td>
              <td>{r.guest_id}</td>
              <td>{r.check_in_date}</td>
              <td>{r.check_out_date}</td>
              <td>
                <span style={statusBadge(r.status)}>{r.status}</span>
              </td>
              <td>
                {r.status === "booked" && (
                  <>
                    <button onClick={() => handleAction("check-in", r.id)}>Check-in</button>{" "}
                    <button onClick={() => handleAction("cancel", r.id)}>Cancel</button>
                  </>
                )}
                {r.status === "checked_in" && (
                  <button onClick={() => handleAction("check-out", r.id)}>Check-out</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{label}</div>
    </div>
  );
}

function statusBadge(status) {
  const colors = {
    booked: { background: "#dbeafe", color: "#1e40af" },
    checked_in: { background: "#dcfce7", color: "#166534" },
    checked_out: { background: "#e5e7eb", color: "#374151" },
    cancelled: { background: "#fee2e2", color: "#991b1b" },
  };
  return {
    ...(colors[status] || {}),
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  };
}

const styles = {
  page: { fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#f8fafc", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  logoutBtn: { background: "#fff", border: "1px solid #cbd5e1", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" },
  statsRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "#fff", padding: "1rem 1.5rem", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
  error: { background: "#fee2e2", color: "#991b1b", padding: "0.6rem", borderRadius: "6px", marginBottom: "1rem" },
};
