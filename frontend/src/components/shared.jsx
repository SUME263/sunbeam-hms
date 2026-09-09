import { colors, serif } from "../theme";

export function PageTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontFamily: serif, fontSize: 24, color: colors.ink, margin: 0 }}>{children}</h2>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: colors.accent, color: "#fff", border: "none", padding: "0.55rem 1.1rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

export function ActionLink({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "none", border: "none", color: danger ? colors.danger : colors.accentDark, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }) {
  const map = {
    booked: { bg: colors.infoBg, color: colors.info, label: "Booked" },
    checked_in: { bg: colors.successBg, color: colors.success, label: "Checked in" },
    checked_out: { bg: "#EDEBE3", color: colors.inkSoft, label: "Checked out" },
    cancelled: { bg: colors.dangerBg, color: colors.danger, label: "Cancelled" },
    available: { bg: colors.successBg, color: colors.success, label: "Available" },
    occupied: { bg: colors.infoBg, color: colors.info, label: "Occupied" },
    maintenance: { bg: colors.dangerBg, color: colors.danger, label: "Maintenance" },
    paid: { bg: colors.successBg, color: colors.success, label: "Paid" },
    pending: { bg: colors.infoBg, color: colors.info, label: "Pending" },
    refunded: { bg: colors.dangerBg, color: colors.danger, label: "Refunded" },
  };
  const s = map[status] || { bg: "#eee", color: "#555", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 999 }}>
      {s.label}
    </span>
  );
}

export function Table({ headers, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", background: colors.panel, borderRadius: 8, overflow: "hidden", border: `1px solid ${colors.border}` }}>
      <thead>
        <tr style={{ background: "#F1EEE4" }}>
          {headers.map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "0.7rem 1rem", fontSize: 12, color: colors.inkSoft, fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export const td = { padding: "0.7rem 1rem", fontSize: 13, color: colors.ink, borderBottom: `1px solid ${colors.border}` };

export function StatCard({ label, value }) {
  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "1rem 1.4rem", minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink }}>{value}</div>
      <div style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,47,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div style={{ background: colors.panel, borderRadius: 8, padding: "1.5rem 1.75rem", width: 380, maxWidth: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: serif, fontSize: 18, margin: 0, color: colors.ink }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.inkSoft }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputStyle = { width: "100%", padding: "0.55rem", marginBottom: 14, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: "border-box", fontSize: 13 };
export const labelStyle = { display: "block", fontSize: 12, marginBottom: 5, color: colors.ink, fontWeight: 600 };
