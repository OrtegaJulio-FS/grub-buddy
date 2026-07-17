import { ForkIcon } from './ForkIcon';
import './ForkRating.css';

const SIZES = { sm: 14, md: 18, lg: 26 };

// Read-only fork rating display. `average` is a float 0-5 (or null for "no
// logs yet"); rendered forks round to the nearest whole fork since the
// design only has filled/unfilled states (no half-fork glyph).
export function ForkRating({ average, count, size = 'md', showCount = true }) {
  const rounded = average == null ? 0 : Math.round(average);
  const px = SIZES[size] || SIZES.md;

  return (
    <div className={`fork-rating fork-rating--${size}`}>
      <div className="fork-rating__forks" role="img" aria-label={average == null ? 'Not yet rated' : `${average.toFixed(1)} out of 5 forks`}>
        {Array.from({ length: 5 }, (_, i) => (
          <ForkIcon key={i} size={px} filled={i < rounded} />
        ))}
      </div>
      {average != null && (
        <span className="fork-rating__value mono">{average.toFixed(1)}</span>
      )}
      {showCount && (
        <span className="fork-rating__count mono">
          {count === 0 ? 'no visits yet' : `${count} visit${count === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  );
}
