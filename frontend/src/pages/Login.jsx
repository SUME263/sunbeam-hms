import { useState } from "react";
import { colors, serif, sans } from "../theme";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Receptionist");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.nav, fontFamily: sans }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onLogin({ full_name: name, role });
        }}
        style={{ background: colors.panel, padding: "2.5rem", borderRadius: 8, width: 340 }}
      >
        <h1 style={{ fontFamily: serif, fontSize: 26, margin: 0, color: colors.ink }}>SunBeam Lodge</h1>
        <p style={{ color: colors.inkSoft, marginTop: 4, marginBottom: 24, fontSize: 14 }}>Staff portal — prototype (mock data)</p>

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chanda Mulenga"
          style={{ width: "100%", padding: "0.6rem", marginBottom: 16, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", marginBottom: 20, border: `1px solid ${colors.border}`, borderRadius: 6 }}
        >
          <option>Receptionist</option>
          <option>Administrator</option>
        </select>

        <button
          type="submit"
          style={{ width: "100%", padding: "0.7rem", background: colors.accent, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
        >
          Sign in
        </button>
        <p style={{ fontSize: 12, color: colors.inkSoft, marginTop: 12 }}>
          Pick a role to see how RBAC changes what you can view — e.g. Reports and Settings only show for Administrator.
        </p>
      </form>
    </div>
  );
}
