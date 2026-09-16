import { useState } from "react";
import {
  PageTitle,
  PrimaryButton,
  Table,
  td,
  inputStyle,
} from "../components/shared";

export default function Guests({ guests, onNew, onEdit }) {
  const [search, setSearch] = useState("");

  const filteredGuests = guests.filter((guest) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return (
      guest.full_name?.toLowerCase().includes(term) ||
      guest.phone?.toLowerCase().includes(term) ||
      guest.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <PageTitle
        action={
          <PrimaryButton onClick={onNew}>
            Add guest
          </PrimaryButton>
        }
      >
        Guests
      </PageTitle>

      <div style={{ marginBottom: 16 }}>
        <input
          style={inputStyle}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
        />
      </div>

      <Table
        headers={[
          "Name",
          "Phone",
          "Email",
          "Nationality",
          "Address",
          "Actions",
        ]}
      >
        {filteredGuests.length > 0 ? (
          filteredGuests.map((g) => (
            <tr key={g.id}>
              <td style={td}>{g.full_name}</td>
              <td style={td}>{g.phone}</td>
              <td style={td}>{g.email || "—"}</td>
              <td style={td}>{g.nationality || "—"}</td>
              <td style={td}>{g.address || "—"}</td>

              <td style={td}>
                <button
                  onClick={() => onEdit(g)}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              style={{
                ...td,
                textAlign: "center",
                padding: "24px",
              }}
              colSpan={6}
            >
              {search
                ? "No guests found matching your search."
                : "No guests have been registered yet."}
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}