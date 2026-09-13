import { useState } from "react";
import {
  PageTitle,
  PrimaryButton,
  Table,
  StatusPill,
  ActionLink,
  td,
} from "../components/shared";
import NewPaymentModal from "../components/modals/NewPaymentModal";

export default function Payments({
  payments,
  reservations,
  guestLabel,
  onStatusChange,
  onCreate,
}) {
  const [showNewPayment, setShowNewPayment] = useState(false);

  const guestForPayment = (reservationId) => {
    const res = reservations.find(
      (r) => r.id === reservationId
    );

    return res ? guestLabel(res.guest_id) : "—";
  };

  return (
    <div>
      <PageTitle
        action={
          <PrimaryButton
            onClick={() => setShowNewPayment(true)}
          >
            New payment
          </PrimaryButton>
        }
      >
        Payments
      </PageTitle>

      <Table
        headers={[
          "Reservation",
          "Guest",
          "Amount (ZMW)",
          "Method",
          "Status",
          "Actions",
        ]}
      >
        {payments.map((p) => (
          <tr key={p.id}>
            <td style={td}>#{p.reservation_id}</td>

            <td style={td}>
              {guestForPayment(p.reservation_id)}
            </td>

            <td style={td}>
              K{Number(p.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>

            <td style={td}>
              {p.method.replace("_", " ")}
            </td>

            <td style={td}>
              <StatusPill status={p.status} />
            </td>

            <td style={td}>
              {p.status === "pending" && (
                <ActionLink
                  onClick={() =>
                    onStatusChange(p.id, "paid")
                  }
                >
                  Mark paid
                </ActionLink>
              )}

              {p.status === "paid" && (
                <ActionLink
                  onClick={() =>
                    onStatusChange(p.id, "refunded")
                  }
                  danger
                >
                  Refund
                </ActionLink>
              )}
            </td>
          </tr>
        ))}
      </Table>

      {payments.length === 0 && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#666",
          }}
        >
          No payments recorded yet.
        </div>
      )}

      {showNewPayment && (
        <NewPaymentModal
          reservations={reservations}
          payments={payments}
          guestLabel={guestLabel}
          onCreate={onCreate}
          onClose={() => setShowNewPayment(false)}
        />
      )}
    </div>
  );
}