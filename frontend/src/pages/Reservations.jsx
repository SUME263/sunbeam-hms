import { PageTitle, PrimaryButton, Table, StatusPill, ActionLink, td } from "../components/shared";

export default function Reservations({ reservations, guestLabel, roomLabel, onStatusChange, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>New reservation</PrimaryButton>}>Reservations</PageTitle>

      <Table headers={["ID", "Guest", "Room", "Check-in", "Check-out", "Status", "Actions"]}>
        {reservations.map((r) => (
          <tr key={r.id}>
            <td style={td}>{r.id}</td>
            <td style={td}>{guestLabel(r.guest_id)}</td>
            <td style={td}>{roomLabel(r.room_id)}</td>
            <td style={td}>{r.check_in_date}</td>
            <td style={td}>{r.check_out_date}</td>
            <td style={td}><StatusPill status={r.status} /></td>
            <td style={td}>
              {r.status === "booked" && (
                <>
                  <ActionLink onClick={() => onStatusChange(r.id, "checked_in")}>Check in</ActionLink>{" "}
                  <ActionLink onClick={() => onStatusChange(r.id, "cancelled")} danger>Cancel</ActionLink>
                </>
              )}
              {r.status === "checked_in" && <ActionLink onClick={() => onStatusChange(r.id, "checked_out")}>Check out</ActionLink>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
