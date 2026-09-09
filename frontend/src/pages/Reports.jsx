import { useMemo } from "react";
import { colors } from "../theme";
import { PageTitle, StatCard, Table, td } from "../components/shared";

export default function Reports({ reservations, rooms, roomTypeLabel, roomLabel, payments }) {
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
        Visible only because you're logged in as Administrator — this mirrors the RBAC rule in the real backend.
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
              <td style={td}>{room ? roomTypeLabel(room.room_type_id) : "—"}</td>
              <td style={td}>{count}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
