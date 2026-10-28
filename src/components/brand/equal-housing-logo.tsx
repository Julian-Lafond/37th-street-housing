/** Equal Housing Opportunity mark: house outline with an equals sign. */
export function EqualHousingLogo({ className = "" }: { className?: string }) {
  return (
    <svg role="img" aria-label="Equal Housing Opportunity" viewBox="0 0 48 48" className={className}>
      <path d="M24 4 3 20h5v22h32V20h5L24 4Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <rect x="15" y="22" width="18" height="4" fill="currentColor" />
      <rect x="15" y="30" width="18" height="4" fill="currentColor" />
    </svg>
  );
}
