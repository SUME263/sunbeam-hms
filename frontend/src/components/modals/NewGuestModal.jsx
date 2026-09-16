import { useState } from "react";

import { colors } from "../../theme";

import {
  ModalShell,
  PrimaryButton,
  inputStyle,
  labelStyle,
} from "../shared";

export default function NewGuestModal({
  guest,
  onClose,
  onCreate,
  onUpdate,
}) {
  const isEditing = Boolean(guest);

  const [form, setForm] = useState({
    full_name: guest?.full_name || "",
    phone: guest?.phone || "",
    email: guest?.email || "",
    nationality: guest?.nationality || "",
    address: guest?.address || "",
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

  const handleSubmit = async () => {
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    // Required fields
    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (!phone) {
      setError("Phone number is required.");
      return;
    }

    // Phone validation
    const phoneDigits = phone.replace(/\D/g, "");

    if (
      phoneDigits.length < 9 ||
      phoneDigits.length > 12 ||
      !/^\+?[\d\s-]+$/.test(phone)
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    // Basic email validation
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    const guestData = {
      full_name: fullName,
      phone: phone,
      email: email || null,
      nationality: form.nationality.trim() || null,
      address: form.address.trim() || null,
    };

    setError("");

    if (isEditing) {
      await onUpdate(guest.id, guestData);
    } else {
      await onCreate(guestData);
    }
  };

  return (
    <ModalShell
      title={isEditing ? "Edit guest" : "Add guest"}
      onClose={onClose}
    >
      <label style={labelStyle}>Full name *</label>

      <input
        style={inputStyle}
        value={form.full_name}
        onChange={(e) =>
          updateField("full_name", e.target.value)
        }
        placeholder="e.g. Mutinta Zulu"
      />

      <label style={labelStyle}>Phone *</label>

      <input
        style={inputStyle}
        value={form.phone}
        onChange={(e) =>
          updateField("phone", e.target.value)
        }
        placeholder="+260 ..."
      />

      <label style={labelStyle}>Email</label>

      <input
        style={inputStyle}
        value={form.email}
        onChange={(e) =>
          updateField("email", e.target.value)
        }
        placeholder="name@example.com"
        type="email"
      />

      <label style={labelStyle}>Nationality</label>

      <input
        style={inputStyle}
        value={form.nationality}
        onChange={(e) =>
          updateField("nationality", e.target.value)
        }
        placeholder="e.g. Zambian"
      />

      <label style={labelStyle}>Address</label>

      <input
        style={inputStyle}
        value={form.address}
        onChange={(e) =>
          updateField("address", e.target.value)
        }
        placeholder="Optional"
      />

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
        {isEditing ? "Save changes" : "Save guest"}
      </PrimaryButton>
    </ModalShell>
  );
}