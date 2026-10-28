/**
 * Stylized, not-to-scale neighborhood illustration: an abstract street grid,
 * a park, the campus as a soft field and the building as a sun mark.
 * Decorative only; real directions come from the map below it.
 */
export function MapIllustration({ className = "" }: { className?: string }) {
  const streets = [40, 95, 150, 205, 260];
  const avenues = [50, 120, 190, 260, 330];
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 380 300" className={className} fill="none">
      <rect width="380" height="300" rx="20" fill="var(--color-dusk-deep)" />
      {/* Campus field */}
      <path d="M200 150c10-28 60-40 120-34 30 3 44 22 42 52-2 40-28 74-80 80-52 6-96-14-96-52 0-18 6-32 14-46Z" fill="var(--color-eucalyptus)" fillOpacity="0.35" />
      {/* Park */}
      <path d="M210 250c18-8 52-8 70 2 12 7 8 26-10 30-24 6-52 2-64-8-8-7-6-19 4-24Z" fill="var(--color-eucalyptus)" fillOpacity="0.2" />
      {/* Street grid */}
      <g stroke="var(--color-plaster)" strokeOpacity="0.16" strokeWidth="1.25">
        {streets.map((y) => (
          <path key={y} d={`M16 ${y}H364`} />
        ))}
        {avenues.map((x) => (
          <path key={x} d={`M${x} 16V284`} />
        ))}
      </g>
      {/* 37th Street, highlighted */}
      <path d="M16 150H364" stroke="var(--color-sunset)" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
      {/* Metro line */}
      <path d="M16 262c80-6 150-4 210 2s110 6 138 2" stroke="var(--color-jacaranda)" strokeWidth="3" strokeLinecap="round" />
      {/* Walking route */}
      <path d="M128 150c22 0 40-2 58-2 10 0 18 0 28 0" stroke="var(--color-peach)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" />
      {/* The building */}
      <circle cx="120" cy="150" r="18" fill="var(--color-sunset)" fillOpacity="0.22" />
      <circle cx="120" cy="150" r="8" fill="var(--color-sunset)" />
      <g style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }} fontSize="9" letterSpacing="1.6">
        <text x="78" y="128" fill="var(--color-plaster)">37TH STREET</text>
        <text x="262" y="160" fill="var(--color-plaster)" fillOpacity="0.8">CAMPUS</text>
        <text x="226" y="244" fill="var(--color-plaster)" fillOpacity="0.6">PARK</text>
        <text x="22" y="254" fill="var(--color-plaster)" fillOpacity="0.6">METRO E LINE</text>
      </g>
    </svg>
  );
}
