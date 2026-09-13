import { useState } from "react";
import { colors } from "../../theme";
import {
  ModalShell,
  PrimaryButton,
  inputStyle,
  labelStyle
} from "../shared";

export default function NewStaffModal({
  onClose,
  onCreate
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Receptionist"
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Name, email and password are required."
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    setError("");

    onCreate({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role
    });
  };

  return (
    <ModalShell
      title="Add staff account"
      onClose={onClose}
    >
      <label style={labelStyle}>
        Full name *
      </label>

      <input
        style={inputStyle}
        value={form.full_name}
        onChange={(e) =>
          updateField("full_name", e.target.value)
        }
        placeholder="e.g. Bwalya Chibale"
      />

      <label style={labelStyle}>
        Email *
      </label>

      <input
        style={inputStyle}
        type="email"
        value={form.email}
        onChange={(e) =>
          updateField("email", e.target.value)
        }
        placeholder="name@sunbeamlodge.co.zm"
      />

      <label style={labelStyle}>
        Password *
      </label>

      <input
        style={inputStyle}
        type="password"
        value={form.password}
        onChange={(e) =>
          updateField("password", e.target.value)
        }
        placeholder="Minimum 8 characters"
      />

      <label style={labelStyle}>
        Role *
      </label>

      <select
        style={inputStyle}
        value={form.role}
        onChange={(e) =>
          updateField("role", e.target.value)
        }
      >
        <option value="Receptionist">
          Receptionist
        </option>

        <option value="Administrator">
          Administrator
        </option>
      </select>

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
        Save staff account
      </PrimaryButton>
    </ModalShell>
  );
}