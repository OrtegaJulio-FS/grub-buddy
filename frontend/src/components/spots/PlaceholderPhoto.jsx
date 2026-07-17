import './PlaceholderPhoto.css';

// Fallback for spots with no cover_photo_url yet - a soft gradient tile with
// the spot's initial, rather than a broken image or mock stock photo.
export function PlaceholderPhoto({ label = '', className = '' }) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={`placeholder-photo ${className}`} aria-hidden="true">
      <span className="placeholder-photo__initial">{initial}</span>
    </div>
  );
}
