import { colors } from "../theme";
import { PageTitle, StatCard, Table, StatusPill, td } from "../components/shared";

export default function Dashboard({ occupancy, reservations, rooms, guestLabel, roomLabel, isAdmin }) {
  const pendingCheckIns = reservations.filter((r) => r.status === "booked").length;

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Total rooms" value={rooms.length} />
        <StatCard label="Occupied" value={occupancy.occupied} />
        {isAdmin && <StatCard label="Occupancy rate" value={`${occupancy.pct}%`} />}
        <StatCard label="Pending check-ins" value={pendingCheckIns} />
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
