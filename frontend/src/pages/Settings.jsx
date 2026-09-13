import { colors } from "../theme";
import {
  PageTitle,
  PrimaryButton,
  Table,
  td,
  ActionLink,
  StatusPill
} from "../components/shared";

export default function Settings({
  staffList,
  onNew,
  onStatusChange
}) {
  return (
    <div>
      <PageTitle
        action={
          <PrimaryButton onClick={onNew}>
            Add staff account
          </PrimaryButton>
        }
      >
        Staff & settings
      </PageTitle>

      <p
        style={{
          fontSize: 13,
          color: colors.inkSoft,
          marginBottom: 16
        }}
      >
        Administrator-only account management.
        Create staff accounts and manage their access.
      </p>

      <Table
        headers={[
          "Name",
          "Email",
          "Role",
          "Status",
          "Actions"
        ]}
      >
        {staffList.length > 0 ? (
          staffList.map((staff) => (
            <tr key={staff.id}>
              <td style={td}>
                <strong>{staff.full_name}</strong>
              </td>

              <td style={td}>
                {staff.email}
              </td>

              <td style={td}>
                {staff.role}
              </td>

              <td style={td}>
                <StatusPill
                  status={
                    staff.is_active
                      ? "active"
                      : "inactive"
                  }
                />
              </td>

              <td style={td}>
                {staff.is_active ? (
                  <ActionLink
                    danger
                    onClick={() =>
                      onStatusChange(
                        staff.id,
                        false
                      )
                    }
                  >
                    Deactivate
                  </ActionLink>
                ) : (
                  <ActionLink
                    onClick={() =>
                      onStatusChange(
                        staff.id,
                        true
                      )
                    }
                  >
                    Activate
                  </ActionLink>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              style={{
                ...td,
                textAlign: "center",
                padding: "24px"
              }}
              colSpan={5}
            >
              No staff accounts found.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}