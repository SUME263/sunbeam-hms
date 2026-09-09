import { colors } from "../theme";
import { PageTitle } from "../components/shared";

export default function Location() {
  return (
    <div>
      <PageTitle>Lodge location</PageTitle>
      <p style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
        Visual placeholder for the Google Maps integration described in your proposal — not functional yet, this
        is where the embedded map and directions widget will sit.
      </p>
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ height: 220, background: "#E4E0D4", display: "flex", alignItems: "center", justifyContent: "center", color: colors.inkSoft, fontSize: 13 }}>
          Map embed placeholder (Google Maps API)
        </div>
        <div style={{ padding: "1rem 1.25rem" }}>
          <div style={{ fontWeight: 600, color: colors.ink, marginBottom: 4 }}>SunBeam Lodge</div>
          <div style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 10 }}>Masaiti District, Copperbelt Province, Zambia</div>
          <button disabled style={{ background: colors.border, color: colors.inkSoft, border: "none", padding: "0.5rem 1rem", borderRadius: 6, fontSize: 13, cursor: "not-allowed" }}>
            Get directions (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
