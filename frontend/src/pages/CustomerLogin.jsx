import { useState } from "react";
import { colors, serif, sans } from "../theme";
import { customerLogin } from "../services/api";

export default function CustomerLogin({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await customerLogin(email, password);

      const { access_token, full_name } = res.data;

    //prevents a customer login from accidentally overwriting the staff session
      localStorage.setItem("customer_access_token", access_token);

      localStorage.setItem(
        "customer",
        JSON.stringify({ full_name, email })
      );

      onLogin({ full_name, email });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.nav,
        fontFamily: sans,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: colors.panel,
          padding: "2.5rem",
          borderRadius: 8,
          width: 340,
        }}
      >
        <h1
          style={{
            fontFamily: serif,
            fontSize: 26,
            margin: 0,
            color: colors.ink,
          }}
        >
          SunBeam Lodge
        </h1>

        <p
          style={{
            color: colors.inkSoft,
            marginTop: 4,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          Guest booking portal
        </p>

        {error && (
          <div
            style={{
              background: colors.dangerBg,
              color: colors.danger,
              padding: "0.6rem",
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <label
          style={{
            display: "block",
            fontSize: 13,
            marginBottom: 6,
            color: colors.ink,
          }}
        >
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          required
          style={{
            width: "100%",
            padding: "0.6rem",
            marginBottom: 16,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 13,
            marginBottom: 6,
            color: colors.ink,
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.6rem",
            marginBottom: 20,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem",
            background: colors.accent,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: colors.inkSoft,
          }}
        >
          Don't have an account?
        </div>

        <button
          type="button"
          onClick={onRegister}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "0.65rem",
            background: "transparent",
            color: colors.accent,
            border: `1px solid ${colors.accent}`,
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create an account
        </button>
      </form>
    </div>
  );
}