// Small static neural-network glyph — the brand mark shown on the login
// card and the sidebar, echoing the animated network from the loading state.
export default function BrandMark({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <g stroke="#0d1f1a" strokeWidth="1.3" strokeLinecap="round">
        <path d="M4 7 12 4M4 7 12 12M4 7 12 20M4 17 12 4M4 17 12 12M4 17 12 20M12 4 20 9M12 12 20 9M12 12 20 16M12 20 20 16" />
      </g>
      <g fill="#0d1f1a">
        <circle cx="4" cy="7" r="1.7" />
        <circle cx="4" cy="17" r="1.7" />
        <circle cx="12" cy="4" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="20" r="1.7" />
        <circle cx="20" cy="9" r="1.7" />
        <circle cx="20" cy="16" r="1.7" />
      </g>
    </svg>
  );
}
