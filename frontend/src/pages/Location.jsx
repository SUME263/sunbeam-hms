import { colors } from "../theme";
import { PageTitle } from "../components/shared";

const LODGE_NAME = "SunBeam Lodge";
const LODGE_ADDRESS = "Lusaka, Lusaka Province, Zambia";

// replace with the actual coordinates of the lodge later on
const LATITUDE = -15.4206;
const LONGITUDE = 28.28189;

const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${LATITUDE},${LONGITUDE}`;

const DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${LATITUDE},${LONGITUDE}`;

const SHARE_MESSAGE =
  `${LODGE_NAME}, ${LODGE_ADDRESS}\n` +
  `Google Maps: ${GOOGLE_MAPS_URL}`;

export default function Location() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: LODGE_NAME,
          text: `Find ${LODGE_NAME} on Google Maps`,
          url: GOOGLE_MAPS_URL,
        });
      } catch (error) {
        // User cancelled the share dialog.
      }
    } else {
      try {
        await navigator.clipboard.writeText(SHARE_MESSAGE);
        alert("Google Maps location copied to clipboard.");
      } catch (error) {
        alert("Unable to copy the location link.");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_MAPS_URL);
      alert("Google Maps link copied to clipboard.");
    } catch (error) {
      alert("Unable to copy the Google Maps link.");
    }
  };

  return (
    <div>
      <PageTitle>Lodge location</PageTitle>

      <p
        style={{
          fontSize: 13,
          color: colors.inkSoft,
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        View the location of SunBeam Lodge, get directions, or share the
        location with a guest through WhatsApp or another messaging service.
      </p>

      <div
        style={{
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Map */}
        <div
          style={{
            height: 380,
            width: "100%",
            background: "#E4E0D4",
          }}
        >
          <iframe
            title="SunBeam Lodge location"
            src={`https://www.google.com/maps?q=${LATITUDE},${LONGITUDE}&z=16&output=embed`}
            width="100%"
            height="100%"
            style={{
              border: 0,
              display: "block",
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Lodge details */}
        <div style={{ padding: "1.25rem" }}>
          <div
            style={{
              fontWeight: 600,
              color: colors.ink,
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            {LODGE_NAME}
          </div>

          <div
            style={{
              fontSize: 13,
              color: colors.inkSoft,
              marginBottom: 14,
            }}
          >
            {LODGE_ADDRESS}
          </div>

          {/* Coordinates */}
          <div
            style={{
              background: colors.background || "#F7F5EF",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "0.75rem",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <div
              style={{
                color: colors.inkSoft,
                marginBottom: 4,
              }}
            >
              Coordinates
            </div>

            <div
              style={{
                color: colors.ink,
                fontWeight: 500,
              }}
            >
              Latitude: {LATITUDE}
              <br />
              Longitude: {LONGITUDE}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: colors.primary || "#B3261E",
                color: "#FFFFFF",
                textDecoration: "none",
                padding: "0.55rem 0.9rem",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Open in Google Maps
            </a>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: colors.panel,
                color: colors.ink,
                textDecoration: "none",
                border: `1px solid ${colors.border}`,
                padding: "0.55rem 0.9rem",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Get directions
            </a>

            <button
              onClick={handleShare}
              style={{
                background: colors.panel,
                color: colors.ink,
                border: `1px solid ${colors.border}`,
                padding: "0.55rem 0.9rem",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Share location
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                background: colors.panel,
                color: colors.ink,
                border: `1px solid ${colors.border}`,
                padding: "0.55rem 0.9rem",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Copy Google Maps link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}