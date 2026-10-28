/**
 * Abstract "room pods" plan generated from bed/bath counts: a corridor with
 * bedroom pods on both sides, each paired with its own bath pod, a common room
 * at the end and a washer/dryer pod. Decorative only (aria-hidden): it is not
 * a floor plan and doesn't show the real layout.
 */

const W = 320;
const H = 200;
const PAD = 14;
const GAP = 6;
const CORRIDOR = 22;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** SVG <rect> attributes from a layout box. */
const box = ({ x, y, w, h }: Rect) => ({ x, y, width: w, height: h });

function layout(bedrooms: number) {
  const top = Math.ceil(bedrooms / 2);
  const bottom = bedrooms - top;
  const cols = top + 1; // last column is the common room
  const colW = (W - PAD * 2 - GAP * (cols - 1)) / cols;
  const rowH = (H - PAD * 2 - CORRIDOR - GAP * 2) / 2;
  const topY = PAD;
  const corridorY = PAD + rowH + GAP;
  const bottomY = corridorY + CORRIDOR + GAP;
  const bathH = rowH * 0.36;
  const bathW = colW * 0.46;

  const pods: { bed: Rect; bath: Rect; n: number }[] = [];
  for (let i = 0; i < bedrooms; i++) {
    const isTop = i < top;
    const col = isTop ? i : i - top;
    const x = PAD + col * (colW + GAP);
    const y = isTop ? topY : bottomY;
    // Bath sits on the corridor side of its bedroom.
    const bath: Rect = { x: x + colW - bathW - 5, y: isTop ? y + rowH - bathH - 5 : y + 5, w: bathW, h: bathH };
    pods.push({ bed: { x, y, w: colW, h: rowH }, bath, n: i + 1 });
  }

  const commonX = PAD + top * (colW + GAP);
  const common: Rect = { x: commonX, y: topY, w: colW, h: H - PAD * 2 };
  const corridor: Rect = { x: PAD, y: corridorY, w: commonX - PAD - GAP, h: CORRIDOR };

  // Washer/dryer takes the empty bottom cell when there is one, otherwise a corner of the common room.
  const laundry: Rect =
    bottom < top
      ? { x: PAD + bottom * (colW + GAP), y: bottomY, w: colW * 0.5, h: rowH * 0.5 }
      : { x: commonX + 6, y: H - PAD - rowH * 0.42 - 6, w: colW * 0.36, h: rowH * 0.42 };

  return { pods, common, corridor, laundry, colW };
}

export function RoomPods({
  bedrooms,
  bathrooms,
  squareFeet,
  className = "",
  tone = "light",
}: {
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  className?: string;
  tone?: "light" | "dark";
}) {
  const { pods, common, corridor, laundry } = layout(bedrooms);
  const dark = tone === "dark";
  const stroke = dark ? "var(--color-plaster)" : "var(--color-ink)";
  const bedFill = dark ? "color-mix(in oklab, var(--color-plaster) 10%, transparent)" : "var(--color-plaster)";
  const label = dark ? "var(--color-mist)" : "var(--color-ink-soft)";

  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} ${H + 18}`} className={className} fill="none">
      {/* Dimension line, architect-style. */}
      {squareFeet && (
        <g stroke={stroke} strokeOpacity="0.35" strokeWidth="0.75">
          <path d={`M${PAD} ${H + 8}H${W - PAD}M${PAD} ${H + 4}v8M${W - PAD} ${H + 4}v8`} />
        </g>
      )}
      {squareFeet && (
        <text
          x={W / 2}
          y={H + 11}
          textAnchor="middle"
          fontSize="7"
          letterSpacing="1.4"
          fill={label}
          style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}
          paintOrder="stroke"
          stroke={dark ? "var(--color-dusk)" : "var(--color-sand)"}
          strokeWidth="6"
        >
          {squareFeet.toLocaleString("en-US")} SQ FT
        </text>
      )}

      {/* Corridor */}
      <rect {...box(corridor)} rx="3" stroke={stroke} strokeOpacity="0.3" strokeDasharray="2 3" strokeWidth="0.75" />
      <path
        d={`M${corridor.x - 2} ${corridor.y + corridor.h / 2 - 4}l6 4-6 4z`}
        fill="var(--color-sunset)"
      />

      {/* Common room */}
      <rect {...box(common)} rx="6" fill={bedFill} stroke={stroke} strokeWidth="1.25" />
      <g stroke={stroke} strokeOpacity="0.18" strokeWidth="0.75">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${common.x + 6} ${common.y + 14 + i * 12}h${common.w - 12}`} />
        ))}
      </g>
      <text x={common.x + common.w / 2} y={common.y + 16} textAnchor="middle" fontSize="7" letterSpacing="1.2" fill={label} style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
        LIVING
      </text>

      {/* Laundry */}
      <rect {...box(laundry)} rx="4" fill="var(--color-jacaranda)" fillOpacity={dark ? 0.35 : 0.22} stroke={stroke} strokeWidth="1" />
      <circle cx={laundry.x + laundry.w / 2} cy={laundry.y + laundry.h / 2} r={Math.min(laundry.w, laundry.h) * 0.24} stroke={stroke} strokeWidth="1" />

      {/* Bedrooms, each paired with a bath */}
      {pods.map(({ bed, bath, n }) => (
        <g key={n}>
          <rect {...box(bed)} rx="6" fill={bedFill} stroke={stroke} strokeWidth="1.25" />
          {/* Hover warmth: opacity only. */}
          <rect
            {...box(bed)}
            rx="6"
            fill="var(--color-peach)"
            className="opacity-0 transition-opacity duration-(--dur-ui) group-hover:opacity-60"
            style={{ transitionDelay: `${n * 60}ms` }}
          />
          {n <= bathrooms && (
            <rect {...box(bath)} rx="3" fill="var(--color-eucalyptus)" fillOpacity={dark ? 0.5 : 0.28} stroke={stroke} strokeWidth="1" />
          )}
          <text x={bed.x + 8} y={bed.y + 15} fontSize="9" fill={stroke} style={{ fontFamily: "var(--font-display)" }}>
            {String(n).padStart(2, "0")}
          </text>
        </g>
      ))}
    </svg>
  );
}
