import { useEffect, useState } from "react";
import { colors } from "../theme";
import {
  PageTitle,
  StatCard,
  Table,
  td,
} from "../components/shared";

export default function Reports({
  reservations,
  rooms,
  roomTypeLabel,
  roomLabel,
  payments,
  revenueReport,
  occupancyReport,
  onLoadRevenueReport,
}) {
  const today = new Date();

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const [startDate, setStartDate] = useState(
    formatDate(firstDayOfMonth)
  );

  const [endDate, setEndDate] = useState(
    formatDate(today)
  );

  const [loading, setLoading] = useState(false);

  const bookingsByRoom = {};

  reservations.forEach((r) => {
    if (r.status !== "cancelled") {
      bookingsByRoom[r.room_id] =
        (bookingsByRoom[r.room_id] || 0) + 1;
    }
  });

  const sortedBookings = Object.entries(bookingsByRoom).sort(
    (a, b) => b[1] - a[1]
  );

  const revenue = Number(
    revenueReport?.total_revenue || 0
  );

  const occupancyRate = Number(
    occupancyReport?.occupancy_rate_pct || 0
  );

  const occupiedRooms =
    occupancyReport?.occupied_rooms ?? 0;

  const totalRooms =
    occupancyReport?.total_rooms ?? rooms.length;

  const pendingPayments = payments.filter(
    (p) => p.status === "pending"
  ).length;

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start date and an end date.");
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be after the end date.");
      return;
    }

    try {
      setLoading(true);

      await onLoadRevenueReport(
        startDate,
        endDate
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle>Reports</PageTitle>

      <p
        style={{
          fontSize: 13,
          color: colors.inkSoft,
          marginBottom: 20,
        }}
      >
        View revenue and occupancy information for the lodge.
      </p>

      {/* Date range */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: 24,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              marginBottom: 5,
              color: colors.inkSoft,
            }}
          >
            Start date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "9px 10px",
              border: "1px solid #ccc",
              borderRadius: 5,
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              marginBottom: 5,
              color: colors.inkSoft,
            }}
          >
            End date
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "9px 10px",
              border: "1px solid #ccc",
              borderRadius: 5,
            }}
          />
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: 5,
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#9ca3af" : "#2563eb",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {loading ? "Loading..." : "Generate report"}
        </button>
      </div>

      {/* Report summary */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <StatCard
          label="Revenue collected (ZMW)"
          value={`K${revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />

        <StatCard
          label="Occupancy rate"
          value={`${occupancyRate.toFixed(2)}%`}
        />

        <StatCard
          label="Occupied rooms"
          value={`${occupiedRooms} / ${totalRooms}`}
        />

        <StatCard
          label="Pending payments"
          value={pendingPayments}
        />
      </div>

      {/* Most booked rooms */}
      <h3
        style={{
          fontSize: 15,
          color: colors.ink,
          marginBottom: 10,
        }}
      >
        Most-booked rooms
      </h3>

      <Table
        headers={[
          "Room",
          "Type",
          "Bookings",
        ]}
      >
        {sortedBookings.map(([roomId, count]) => {
          const room = rooms.find(
            (r) => r.id === Number(roomId)
          );

          return (
            <tr key={roomId}>
              <td style={td}>
                {roomLabel(Number(roomId))}
              </td>

              <td style={td}>
                {room
                  ? roomTypeLabel(room.room_type_id)
                  : "—"}
              </td>

              <td style={td}>{count}</td>
            </tr>
          );
        })}
      </Table>

      {sortedBookings.length === 0 && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#666",
          }}
        >
          No booking data available.
        </div>
      )}
    </div>
  );
}