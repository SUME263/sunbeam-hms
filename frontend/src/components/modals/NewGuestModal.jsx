import { useState } from "react";
import { colors } from "../../theme";
import { ModalShell, PrimaryButton, inputStyle, labelStyle } from "../shared";

export default function NewGuestModal({ onClose, onCreate }) {
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <ModalShell title="Add guest" onClose={onClose}>
      <label style={labelStyle}>Full name</label>
      <input style={inputStyle} value={full_name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mutinta Zulu" />
      <label style={labelStyle}>Phone</label>
      <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+260 ..." />
      <label style={labelStyle}>Email (optional)</label>
      <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      {error && <div style={{ color: colors.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton
        onClick={() => {
          if (!full_name.trim() || !phone.trim()) {
            setError("Name and phone are required.");
            return;
          }
          onCreate({ full_name, phone, email });
        }}
      >
        Save guest
      </PrimaryButton>
    </ModalShell>
  );
}
