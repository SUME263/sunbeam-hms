import { useState } from "react";
import { colors } from "../../theme";
import { overlaps } from "../../utils";
import { ModalShell, PrimaryButton, inputStyle, labelStyle } from "../shared";

export default function NewReservationModal({ rooms, guests, reservations, roomTypeLabel, onClose, onCreate }) {
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
      (r) =>
        r.room_id === Number(room_id) &&
        r.status !== "cancelled" &&
        overlaps(check_in_date, check_out_date, r.check_in_date, r.check_out_date)
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
          <option key={r.id} value={r.id}>{r.room_number} — {roomTypeLabel(r.room_type_id)}</option>
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
