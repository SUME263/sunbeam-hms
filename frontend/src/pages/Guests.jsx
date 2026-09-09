import { PageTitle, PrimaryButton, Table, td } from "../components/shared";

export default function Guests({ guests, onNew }) {
  return (
    <div>
      <PageTitle action={<PrimaryButton onClick={onNew}>Add guest</PrimaryButton>}>Guests</PageTitle>
      <Table headers={["Name", "Phone", "Email"]}>
        {guests.map((g) => (
          <tr key={g.id}>
            <td style={td}>{g.full_name}</td>
            <td style={td}>{g.phone}</td>
            <td style={td}>{g.email}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
