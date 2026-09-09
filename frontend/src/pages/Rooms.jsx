import { colors } from "../theme";
import { PageTitle, Table, StatusPill, ActionLink, td } from "../components/shared";

export default function Rooms({ rooms, roomTypeLabel, onStatusChange }) {
  return (
    <div>
      <PageTitle>Rooms</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        Room status updates automatically on check-in/check-out — you can also set maintenance manually here.
      </p>
      <Table headers={["Room", "Type", "Status", "Actions"]}>
        {rooms.map((r) => (
          <tr key={r.id}>
            <td style={td}>{r.room_number}</td>
            <td style={td}>{roomTypeLabel(r.room_type_id)}</td>
            <td style={td}><StatusPill status={r.status} /></td>
            <td style={td}>
              {r.status !== "maintenance" ? (
                <ActionLink onClick={() => onStatusChange(r.id, "maintenance")} danger>Mark maintenance</ActionLink>
              ) : (
                <ActionLink onClick={() => onStatusChange(r.id, "available")}>Mark available</ActionLink>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
