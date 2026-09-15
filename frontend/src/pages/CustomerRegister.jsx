import { useState } from "react";
import { colors, serif, sans } from "../theme";
import { customerRegister } from "../services/api";

export default function CustomerRegister({ onRegister, onLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await customerRegister(
        fullName,
        email,
        phone,
        password
      );

      const { access_token, full_name } = response.data;

      localStorage.setItem(
        "customer_access_token",
        access_token
      );

      localStorage.setItem(
        "customer",
        JSON.stringify({
          full_name,
          email: email.trim().toLowerCase(),
        })
      );

      onRegister({
        full_name,
        email: email.trim().toLowerCase(),
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: sans,
        color: colors.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: colors.panel,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="register-header"
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: serif,
                color: colors.ink,
                fontSize: "1.6rem",
              }}
            >
              SunBeam Lodge
            </h1>

            <p
              style={{
                margin: "0.25rem 0 0",
                color: colors.inkSoft,
                fontSize: "0.9rem",
              }}
            >
              Customer Booking Portal
            </p>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 500,
            background: colors.panel,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                margin: "0 0 0.4rem",
                color: colors.accent,
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Create an account
            </p>

            <h2
              style={{
                margin: 0,
                fontFamily: serif,
                fontSize: "1.8rem",
              }}
            >
              Join SunBeam Lodge
            </h2>

            <p
              style={{
                color: colors.inkSoft,
                lineHeight: 1.5,
                marginBottom: 0,
              }}
            >
              Create an account to make and manage your
              reservations online.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Full name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email address"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Phone number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter your phone number"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="At least 8 characters"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Confirm password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.8rem 1rem",
                  borderRadius: 6,
                  background: "#fef3f2",
                  color: "#b42318",
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButton,
                width: "100%",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: `1px solid ${colors.border}`,
              textAlign: "center",
              color: colors.inkSoft,
              fontSize: "0.9rem",
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLogin}
              style={{
                border: "none",
                background: "none",
                padding: 0,
                color: colors.accent,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: sans,
              }}
            >
              Sign in
            </button>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 600px) {
          .register-header {
            padding: 0.85rem 1rem !important;
          }

          main {
            padding: 1rem !important;
            align-items: flex-start !important;
            padding-top: 1.5rem !important;
          }

          main section {
            padding: 1.25rem !important;
          }
        }

        @media (max-width: 420px) {
          main {
            padding: 0.75rem !important;
            padding-top: 1rem !important;
          }

          main section {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontWeight: 600,
  fontSize: "0.9rem",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.75rem",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontFamily: sans,
  fontSize: "0.95rem",
  background: "#fff",
};

const primaryButton = {
  padding: "0.75rem 1rem",
  background: colors.accent,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: sans,
  fontSize: "0.95rem",
};