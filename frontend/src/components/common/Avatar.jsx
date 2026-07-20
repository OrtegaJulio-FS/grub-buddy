import './Avatar.css';

// Renders the real avatar image when one's been uploaded (see Phase 8's
// Cloudinary pipeline + Edit Profile flow); falls back to the initial-based
// circle everywhere a `src` isn't available (e.g. reviewer/activity avatars,
// which don't carry avatar_url through their queries yet).
export function Avatar({ name = '', src, size = 'md' }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={`avatar avatar--${size}`}>
      {src ? (
        <img className="avatar__image" src={src} alt={name} />
      ) : (
        <span className="avatar__initial" aria-hidden="true">
          {initial}
        </span>
      )}
    </div>
  );
}
