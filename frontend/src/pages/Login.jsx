import { useState } from "react";
import { colors, serif, sans } from "../theme";
import { login } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      const { access_token, role, full_name } = res.data;

      localStorage.setItem("access_token", access_token);

      localStorage.setItem(
        "staff",
        JSON.stringify({ full_name, role })
      );

      onLogin({ full_name, role });
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.nav, fontFamily: sans }}>
      <form onSubmit={handleSubmit} style={{ background: colors.panel, padding: "2.5rem", borderRadius: 8, width: 340 }}>
        <h1 style={{ fontFamily: serif, fontSize: 26, margin: 0, color: colors.ink }}>SunBeam Lodge</h1>
        <p style={{ color: colors.inkSoft, marginTop: 4, marginBottom: 24, fontSize: 14 }}>Staff portal login</p>

        {error && (
          <div style={{ background: colors.dangerBg, color: colors.danger, padding: "0.6rem", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@sunbeamlodge.co.zm"
          required
          style={{ width: "100%", padding: "0.6rem", marginBottom: 16, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: colors.ink }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "0.6rem", marginBottom: 20, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "0.7rem", background: colors.accent, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
