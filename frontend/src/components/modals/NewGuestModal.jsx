import { useState } from "react";
import { colors } from "../../theme";
import {
  ModalShell,
  PrimaryButton,
  inputStyle,
  labelStyle
} from "../shared";

export default function NewGuestModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    nationality: "",
    address: ""
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    setError("");

    onCreate({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      nationality: form.nationality.trim() || null,
      address: form.address.trim() || null
    });
  };

  return (
    <ModalShell title="Add guest" onClose={onClose}>
      <label style={labelStyle}>Full name *</label>
      <input
        style={inputStyle}
        value={form.full_name}
        onChange={(e) => updateField("full_name", e.target.value)}
        placeholder="e.g. Mutinta Zulu"
      />

      <label style={labelStyle}>Phone *</label>
      <input
        style={inputStyle}
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
        placeholder="+260 ..."
      />

      <label style={labelStyle}>Email</label>
      <input
        style={inputStyle}
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="name@example.com"
        type="email"
      />

      <label style={labelStyle}>Nationality</label>
      <input
        style={inputStyle}
        value={form.nationality}
        onChange={(e) => updateField("nationality", e.target.value)}
        placeholder="e.g. Zambian"
      />

      <label style={labelStyle}>Address</label>
      <input
        style={inputStyle}
        value={form.address}
        onChange={(e) => updateField("address", e.target.value)}
        placeholder="Optional"
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

      <PrimaryButton onClick={handleSubmit}>
        Save guest
      </PrimaryButton>
    </ModalShell>
  );
}