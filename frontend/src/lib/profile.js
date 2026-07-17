// There's no `username`/handle field on the backend's users table yet - just
// derive a display-only @handle from the person's name so the profile header
// has something to show. Purely cosmetic, not persisted or sent anywhere;
// swap for a real column whenever one gets added.
export function deriveHandle(name) {
  if (!name) return '@grubbud';
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `@${slug || 'grubbud'}`;
}
