import { useState } from "react";

export default function NewPaymentModal({
  reservations,
  guestLabel,
  onCreate,
  onClose,
}) {
  const [reservationId, setReservationId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeReservations = reservations.filter(
    (reservation) => reservation.status !== "cancelled"
  );

  const selectedReservation = activeReservations.find(
    (reservation) => reservation.id === Number(reservationId)
  );

  const reservationTotal = selectedReservation
    ? Number(selectedReservation.total_amount || 0)
    : 0;

  const paidAmount = selectedReservation
    ? 0
    : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!reservationId) {
      setError("Please select a reservation.");
      return;
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (reservationTotal > 0 && paymentAmount > reservationTotal) {
      setError(
        `Payment cannot exceed the reservation total of K${reservationTotal.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        reservation_id: Number(reservationId),
        amount: paymentAmount,
        method,
      });

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create payment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "500px",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>New Payment</h2>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "10px 12px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            Reservation
          </label>

          <select
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <option value="">Select reservation</option>

            {activeReservations.map((reservation) => (
              <option
                key={reservation.id}
                value={reservation.id}
              >
                #{reservation.id} —{" "}
                {guestLabel(reservation.guest_id)} —{" "}
                K{Number(reservation.total_amount || 0).toFixed(2)}
              </option>
            ))}
          </select>

          {selectedReservation && (
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              <strong>Reservation total:</strong>{" "}
              K{reservationTotal.toFixed(2)}
            </div>
          )}

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            Amount
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            Payment method
          </label>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "24px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "10px 16px",
                border: "1px solid #ccc",
                background: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 16px",
                border: "none",
                background: "#b5121b",
                color: "#fff",
                borderRadius: "6px",
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "Creating..." : "Create payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}