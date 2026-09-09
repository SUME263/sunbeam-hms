import { colors } from "../theme";
import { PageTitle, PrimaryButton, Table, td } from "../components/shared";

export default function Settings({ staffList, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>Add staff account</PrimaryButton>}>Staff & settings</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        This is where Administrator-only account management lives — matches the "change system settings" use case.
      </p>
      <Table headers={["Name", "Email", "Role"]}>
        {staffList.map((s) => (
          <tr key={s.id}>
            <td style={td}>{s.full_name}</td>
            <td style={td}>{s.email}</td>
            <td style={td}>{s.role}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
