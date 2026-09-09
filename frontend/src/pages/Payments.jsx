import { PageTitle, Table, StatusPill, ActionLink, td } from "../components/shared";

export default function Payments({ payments, reservations, guestLabel, onStatusChange }) {
  const guestForPayment = (reservationId) => {
    const res = reservations.find((r) => r.id === reservationId);
    return res ? guestLabel(res.guest_id) : "—";
  };

  return (
    <div>
      <PageTitle>Payments</PageTitle>
      <Table headers={["Reservation", "Guest", "Amount (ZMW)", "Method", "Status", "Actions"]}>
        {payments.map((p) => (
          <tr key={p.id}>
            <td style={td}>#{p.reservation_id}</td>
            <td style={td}>{guestForPayment(p.reservation_id)}</td>
            <td style={td}>{p.amount.toLocaleString()}</td>
            <td style={td}>{p.method.replace("_", " ")}</td>
            <td style={td}><StatusPill status={p.status} /></td>
            <td style={td}>
              {p.status === "pending" && <ActionLink onClick={() => onStatusChange(p.id, "paid")}>Mark paid</ActionLink>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
