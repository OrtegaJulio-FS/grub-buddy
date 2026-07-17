import './Avatar.css';

// Initial-based circle avatar - no real photo upload on the backend yet
// (users.avatar_url exists but nothing writes to it), so this is the only
// avatar rendering used until real images are wired up.
export function Avatar({ name = '', size = 'md' }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={`avatar avatar--${size}`} aria-hidden="true">
      <span className="avatar__initial">{initial}</span>
    </div>
  );
}
