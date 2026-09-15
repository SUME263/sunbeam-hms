import { useState } from "react";
import { colors, serif, sans } from "../theme";
import {
  getCustomerRooms,
  checkCustomerAvailability,
  createCustomerReservation,
  listCustomerReservations,
} from "../services/api";

export default function CustomerDashboard({ customer, onSignOut }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      const response = await listCustomerReservations();
      setReservations(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your reservations."
      );
    }
  };

  const handleBrowseRooms = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await getCustomerRooms();

      setRooms(response.data);

      await loadReservations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load available rooms."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    setError("");
    setMessage("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select both check-in and check-out dates."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await checkCustomerAvailability(
        checkIn,
        checkOut,
        null
      );

      setRooms(response.data);

      if (response.data.length === 0) {
        setMessage(
          "No rooms are available for the selected dates."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to check room availability."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (room) => {
    setError("");
    setMessage("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select your check-in and check-out dates first."
      );
      return;
    }

    setBookingRoom(room.id);

    try {
      await createCustomerReservation({
        guest_id: 0,
        room_id: room.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
      });

      setMessage(
        `Room ${room.room_number} has been successfully reserved.`
      );

      await loadReservations();

      const response = await checkCustomerAvailability(
        checkIn,
        checkOut,
        null
      );

      setRooms(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create the reservation."
      );
    } finally {
      setBookingRoom(null);
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: sans,
        color: colors.ink,
      }}
    >
      <header
        style={{
          background: colors.panel,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="customer-header"
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: serif,
                color: colors.ink,
                fontSize: "1.6rem",
              }}
            >
              SunBeam Lodge
            </h1>

            <p
              style={{
                margin: "0.25rem 0 0",
                color: colors.inkSoft,
                fontSize: "0.9rem",
              }}
            >
              Customer Booking Portal
            </p>
          </div>

          <button
            onClick={onSignOut}
            style={{
              padding: "0.65rem 1rem",
              border: "none",
              borderRadius: 6,
              background: colors.accent,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main
        className="customer-main"
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <section
          style={{
            background: colors.panel,
            borderRadius: 10,
            padding: "2rem",
            marginBottom: "2rem",
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                margin: "0 0 0.4rem",
                color: colors.accent,
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Book your stay
            </p>

            <h2
              style={{
                margin: 0,
                fontFamily: serif,
                fontSize: "1.8rem",
              }}
            >
              Welcome, {customer.full_name}
            </h2>

            <p
              style={{
                color: colors.inkSoft,
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              Search for an available room and make your reservation.
            </p>
          </div>

          <div
            className="booking-fields"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Check-in
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(event) =>
                  setCheckIn(event.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Check-out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(event) =>
                  setCheckOut(event.target.value)
                }
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleCheckAvailability}
              disabled={loading}
              style={{
                ...primaryButton,
                height: "42px",
              }}
            >
              {loading ? "Checking..." : "Check Availability"}
            </button>
          </div>

          <button
            onClick={handleBrowseRooms}
            disabled={loading}
            style={{
              ...secondaryButton,
              marginTop: "1rem",
            }}
          >
            Browse All Rooms
          </button>

          {error && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.8rem 1rem",
                borderRadius: 6,
                background: "#fef3f2",
                color: "#b42318",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.8rem 1rem",
                borderRadius: 6,
                background: "#ecfdf3",
                color: "#16794a",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                margin: 0,
                fontFamily: serif,
                fontSize: "1.6rem",
              }}
            >
              Available Rooms
            </h2>

            <p
              style={{
                margin: "0.4rem 0 0",
                color: colors.inkSoft,
              }}
            >
              Choose a room that suits your stay.
            </p>
          </div>

          {rooms.length === 0 ? (
            <div
              style={{
                background: colors.panel,
                border: `1px dashed ${colors.border}`,
                borderRadius: 10,
                padding: "2rem",
                textAlign: "center",
                color: colors.inkSoft,
              }}
            >
              Select your dates and check availability.
            </div>
          ) : (
            <div
              className="room-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: colors.panel,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "260px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.35rem 0.6rem",
                        borderRadius: 5,
                        background: colors.bg,
                        color: colors.inkSoft,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {room.room_type_name}
                    </span>

                    <h3
                      style={{
                        margin: "1rem 0 0.5rem",
                        fontFamily: serif,
                        fontSize: "1.35rem",
                      }}
                    >
                      Room {room.room_number}
                    </h3>

                    <p
                      style={{
                        color: colors.inkSoft,
                        margin: "0.4rem 0",
                      }}
                    >
                      Capacity: {room.capacity} guest
                      {room.capacity !== 1 ? "s" : ""}
                    </p>

                    <p
                      style={{
                        margin: "1rem 0",
                        fontSize: "1.15rem",
                        fontWeight: 700,
                      }}
                    >
                      K{Number(room.base_price).toFixed(2)}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 400,
                          color: colors.inkSoft,
                        }}
                      >
                        {" "}
                        per night
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleBookRoom(room)}
                    disabled={bookingRoom === room.id}
                    style={{
                      ...primaryButton,
                      width: "100%",
                    }}
                  >
                    {bookingRoom === room.id
                      ? "Booking..."
                      : "Book Room"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                margin: 0,
                fontFamily: serif,
                fontSize: "1.6rem",
              }}
            >
              My Reservations
            </h2>

            <p
              style={{
                margin: "0.4rem 0 0",
                color: colors.inkSoft,
              }}
            >
              View your current and previous bookings.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div
              style={{
                background: colors.panel,
                border: `1px dashed ${colors.border}`,
                borderRadius: 10,
                padding: "2rem",
                textAlign: "center",
                color: colors.inkSoft,
              }}
            >
              You do not have any reservations yet.
            </div>
          ) : (
            <div
              className="reservation-container"
              style={{
                background: colors.panel,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "650px",
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeader}>Room</th>
                    <th style={tableHeader}>Check-in</th>
                    <th style={tableHeader}>Check-out</th>
                    <th style={tableHeader}>Amount</th>
                    <th style={tableHeader}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td style={tableCell}>
                        Room {reservation.room_id}
                      </td>

                      <td style={tableCell}>
                        {reservation.check_in_date}
                      </td>

                      <td style={tableCell}>
                        {reservation.check_out_date}
                      </td>

                      <td style={tableCell}>
                        K
                        {reservation.total_amount
                          ? Number(
                              reservation.total_amount
                            ).toFixed(2)
                          : "0.00"}
                      </td>

                      <td style={tableCell}>
                        {formatStatus(reservation.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @media (max-width: 700px) {
          .customer-header {
            padding: 0.85rem 1rem !important;
          }

          .customer-main {
            padding: 1rem !important;
          }

          .customer-main section {
            padding: 1.25rem !important;
          }

          .booking-fields {
            grid-template-columns: 1fr !important;
          }

          .booking-fields button {
            width: 100%;
          }

          .room-grid {
            grid-template-columns: 1fr !important;
          }

          .customer-main h2 {
            font-size: 1.4rem !important;
          }

          .customer-main h3 {
            font-size: 1.25rem !important;
          }

          .reservation-container {
            overflow-x: auto;
          }
        }

        @media (max-width: 420px) {
          .customer-header h1 {
            font-size: 1.3rem !important;
          }

          .customer-header p {
            font-size: 0.75rem !important;
          }

          .customer-header button {
            padding: 0.55rem 0.7rem !important;
            font-size: 0.8rem;
          }

          .customer-main {
            padding: 0.75rem !important;
          }

          .customer-main section {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.7rem",
  marginTop: "0.4rem",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontFamily: sans,
  fontSize: "0.95rem",
  background: "#fff",
};

const primaryButton = {
  padding: "0.7rem 1rem",
  background: colors.accent,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: sans,
};

const secondaryButton = {
  padding: "0.7rem 1rem",
  background: "transparent",
  color: colors.accent,
  border: `1px solid ${colors.accent}`,
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: sans,
};

const tableHeader = {
  textAlign: "left",
  padding: "0.8rem",
  borderBottom: "1px solid #ddd",
};

const tableCell = {
  padding: "0.8rem",
  borderBottom: "1px solid #eee",
};