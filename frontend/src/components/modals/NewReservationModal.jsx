import { useState } from "react";
import { colors } from "../../theme";
import { overlaps } from "../../utils";
import {
  ModalShell,
  PrimaryButton,
  inputStyle,
  labelStyle
} from "../shared";

export default function NewReservationModal({
  rooms,
  guests,
  reservations,
  roomTypeLabel,
  onClose,
  onCreate
}) {
  const [guest_id, setGuestId] = useState(
    guests[0]?.id || ""
  );

  const [room_id, setRoomId] = useState(
    rooms[0]?.id || ""
  );

  const [check_in_date, setCheckIn] = useState("");
  const [check_out_date, setCheckOut] = useState("");
 
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");

    // required fields for validation
    if (
      !guest_id ||
      !room_id ||
      !check_in_date ||
      !check_out_date
    ) {
      setError("All fields are required.");
      return;
    }

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    if (check_in_date < todayString) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    if (
      new Date(check_out_date) <=
      new Date(check_in_date)
    ) {
      setError("Check-out must be after check-in.");
      return;
    }

    //finding selected room 
    const selectedRoom = rooms.find(
      (room) => room.id === Number(room_id)
    );

    if (!selectedRoom) {
      setError("Please select a valid room.");
      return;
    }

    if (selectedRoom.status === "maintenance") {
      setError(
        "This room is currently under maintenance."
      );
      return;
    }

    // frontend conflict check 
    const conflict = reservations.some(
      (reservation) =>
        reservation.room_id === Number(room_id) &&
        reservation.status !== "cancelled" &&
        overlaps(
          check_in_date,
          check_out_date,
          reservation.check_in_date,
          reservation.check_out_date
        )
    );

    if (conflict) {
      setError(
        "This room is already booked for an overlapping date range."
      );
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        guest_id: Number(guest_id),
        room_id: Number(room_id),
        check_in_date,
        check_out_date
      });
    } catch (error) {
      console.error(
        "Failed to create reservation:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to create reservation."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="New reservation"
      onClose={onClose}
    >
      <label style={labelStyle}>
        Guest
      </label>

      <select
        style={inputStyle}
        value={guest_id}
        onChange={(e) => {
          setGuestId(e.target.value);
          setError("");
        }}
      >
        {guests.map((guest) => (
          <option
            key={guest.id}
            value={guest.id}
          >
            {guest.full_name}
          </option>
        ))}
      </select>

      <label style={labelStyle}>
        Room
      </label>

      <select
        style={inputStyle}
        value={room_id}
        onChange={(e) => {
          setRoomId(e.target.value);
          setError("");
        }}
      >
        {rooms.map((room) => (
          <option
            key={room.id}
            value={room.id}
            disabled={room.status === "maintenance"}
          >
            {room.room_number} —{" "}
            {roomTypeLabel(room.room_type_id)}
            {room.status === "maintenance"
              ? " (Maintenance)"
              : ""}
          </option>
        ))}
      </select>

      <label style={labelStyle}>
        Check-in
      </label>

      <input
        style={inputStyle}
        type="date"
        value={check_in_date}
         min={new Date().toISOString().split("T")[0]}
        onChange={(e) => {
          setCheckIn(e.target.value);
          setError("");
        }}
      />

      <label style={labelStyle}>
        Check-out
      </label>

      <input
        style={inputStyle}
        type="date"
        value={check_out_date}
         min={check_in_date || new Date().toISOString().split("T")[0]}
        onChange={(e) => {
          setCheckOut(e.target.value);
          setError("");
        }}
      />

      {error && (
        <div
          style={{
            color: colors.danger,
            fontSize: 12,
            marginBottom: 10
          }}
        >
          {error}
        </div>
      )}

      <PrimaryButton
        onClick={submit}
        disabled={saving}
      >
        {saving
          ? "Creating..."
          : "Create reservation"}
      </PrimaryButton>
    </ModalShell>
  );
}