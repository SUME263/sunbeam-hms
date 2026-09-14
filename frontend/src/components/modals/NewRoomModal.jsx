import { useState } from "react";
import { colors } from "../../theme";
import {
  ModalShell,
  PrimaryButton,
  inputStyle,
  labelStyle,
} from "../shared";

export default function NewRoomModal({
  roomTypes,
  onClose,
  onCreate,
}) {
  const [form, setForm] = useState({
    room_number: "",
    room_type_id: roomTypes[0]?.id || "",
    floor: "",
    status: "available",
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = () => {
    const roomNumber = form.room_number.trim();
    const floor = form.floor.trim();

    if (!roomNumber) {
      setError("Room number is required.");
      return;
    }

    if (roomNumber.length > 10) {
      setError("Room number must be 10 characters or fewer.");
      return;
    }

    // Allow room numbers such as 101, 201A, G01, etc.
    if (!/^[A-Za-z0-9-]+$/.test(roomNumber)) {
      setError(
        "Room number can only contain letters, numbers, or hyphens."
      );
      return;
    }

    if (!form.room_type_id) {
      setError("Please select a room type.");
      return;
    }

    if (floor.length > 10) {
      setError("Floor must be 10 characters or fewer.");
      return;
    }

    setError("");

    onCreate({
      room_number: roomNumber,
      room_type_id: Number(form.room_type_id),
      floor: floor || null,
      status: form.status,
    });
  };

  return (
    <ModalShell title="Add room" onClose={onClose}>
      <label style={labelStyle}>Room number *</label>
      <input
        style={inputStyle}
        value={form.room_number}
        onChange={(e) =>
          updateField("room_number", e.target.value)
        }
        placeholder="e.g. 101"
      />

      <label style={labelStyle}>Room type *</label>
      <select
        style={inputStyle}
        value={form.room_type_id}
        onChange={(e) =>
          updateField("room_type_id", e.target.value)
        }
      >
        {roomTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Floor</label>
      <input
        style={inputStyle}
        value={form.floor}
        onChange={(e) =>
          updateField("floor", e.target.value)
        }
        placeholder="e.g. Ground Floor"
      />

      <label style={labelStyle}>Status</label>
      <select
        style={inputStyle}
        value={form.status}
        onChange={(e) =>
          updateField("status", e.target.value)
        }
      >
        <option value="available">Available</option>
        <option value="maintenance">Maintenance</option>
      </select>

      {error && (
        <div
          style={{
            color: colors.danger,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      <PrimaryButton onClick={handleSubmit}>
        Save room
      </PrimaryButton>
    </ModalShell>
  );
}