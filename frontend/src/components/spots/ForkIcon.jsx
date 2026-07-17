// A single fork glyph. `filled` renders solid mustard; otherwise a faint outline.
export function ForkIcon({ filled, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 2v7.5a2.5 2.5 0 0 0 5 0V2M9.5 2v7.5M12 2v7.5"
        stroke={filled ? 'var(--color-highlight)' : 'var(--color-border)'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9.5 12v10"
        stroke={filled ? 'var(--color-highlight)' : 'var(--color-border)'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
