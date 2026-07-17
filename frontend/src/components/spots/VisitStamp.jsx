import './VisitStamp.css';

// The signature "logged this" badge - a dashed-circle stamp reading
// "GRUBBUDS ✓ LOGGED". `size="sm"` for Feed cards, `size="lg"` for the Spot
// Page hero. `animate` plays the pop-in used right after a successful log.
export function VisitStamp({ size = 'sm', animate = false }) {
  return (
    <div
      className={`visit-stamp visit-stamp--${size} ${animate ? 'visit-stamp--animate' : ''}`}
      role="img"
      aria-label="Logged on Grubbuds"
    >
      <span className="visit-stamp__text mono">
        <span className="visit-stamp__line">GRUBBUDS</span>
        <span className="visit-stamp__line visit-stamp__line--check">✓ LOGGED</span>
      </span>
    </div>
  );
}
