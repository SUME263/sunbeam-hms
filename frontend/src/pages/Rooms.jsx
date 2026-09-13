import { colors } from "../theme";
import {
  PageTitle,
  PrimaryButton,
  Table,
  StatusPill,
  ActionLink,
  td
} from "../components/shared";

export default function Rooms({
  rooms,
  roomTypes,
  onNew,
  onStatusChange
}) {
  const roomTypeLabel = (id) => {
    return (
      roomTypes.find((type) => type.id === id)?.name || "—"
    );
  };

  return (
    <div>
      <PageTitle
        action={
          <PrimaryButton onClick={onNew}>
            Add room
          </PrimaryButton>
        }
      >
        Rooms
      </PageTitle>

      <p
        style={{
          fontSize: 13,
          color: colors.inkSoft,
          marginBottom: 16
        }}
      >
        Manage room details and availability. Room status is
        updated automatically during check-in and check-out.
      </p>

      <Table
        headers={[
          "Room",
          "Type",
          "Capacity",
          "Price / Night",
          "Floor",
          "Status",
          "Actions"
        ]}
      >
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const roomType = roomTypes.find(
              (type) => type.id === room.room_type_id
            );

            return (
              <tr key={room.id}>
                <td style={td}>
                  <strong>{room.room_number}</strong>
                </td>

                <td style={td}>
                  {room.room_type_name ||
                    roomType?.name ||
                    "—"}
                </td>

                <td style={td}>
                  {room.capacity ??
                    roomType?.capacity ??
                    "—"}
                </td>

                <td style={td}>
                  K{" "}
                  {Number(
                    room.base_price ??
                      roomType?.base_price ??
                      0
                  ).toLocaleString()}
                </td>

                <td style={td}>
                  {room.floor || "—"}
                </td>

                <td style={td}>
                  <StatusPill status={room.status} />
                </td>

                <td style={td}>
                  {room.status !== "maintenance" ? (
                    <ActionLink
                      onClick={() =>
                        onStatusChange(
                          room.id,
                          "maintenance"
                        )
                      }
                      danger
                    >
                      Mark maintenance
                    </ActionLink>
                  ) : (
                    <ActionLink
                      onClick={() =>
                        onStatusChange(
                          room.id,
                          "available"
                        )
                      }
                    >
                      Mark available
                    </ActionLink>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              style={{
                ...td,
                textAlign: "center",
                padding: "24px"
              }}
              colSpan={7}
            >
              No rooms have been added yet.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}