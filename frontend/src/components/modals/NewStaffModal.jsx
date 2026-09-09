import { useState } from "react";
import { colors } from "../../theme";
import { ModalShell, PrimaryButton, inputStyle, labelStyle } from "../shared";

export default function NewStaffModal({ onClose, onCreate }) {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Receptionist");
  const [error, setError] = useState("");

  return (
    <ModalShell title="Add staff account" onClose={onClose}>
      <label style={labelStyle}>Full name</label>
      <input style={inputStyle} value={full_name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bwalya Chibale" />
      <label style={labelStyle}>Email</label>
      <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@sunbeamlodge.co.zm" />
      <label style={labelStyle}>Role</label>
      <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Receptionist</option>
        <option>Administrator</option>
      </select>
      {error && <div style={{ color: colors.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton
        onClick={() => {
          if (!full_name.trim() || !email.trim()) {
            setError("Name and email are required.");
            return;
          }
          onCreate({ full_name, email, role });
        }}
      >
        Save staff account
      </PrimaryButton>
    </ModalShell>
  );
}
