import { useState } from 'react';
import './SegmentedSearchBar.css';

const SEGMENTS = [
  { key: 'location', label: 'Location', placeholder: 'Search by city...' },
  { key: 'cuisine', label: 'Cuisine', placeholder: 'Search by cuisine or category...' },
  { key: 'friends', label: 'Trusted by friends', placeholder: 'Coming soon', disabled: true },
];

// Three-way segmented search: Location and Cuisine map straight to the
// `city`/`category` query params GET /spots already supports. "Trusted by
// friends" has no backend yet (no /follows routes, single fake user) so it's
// rendered disabled rather than wired to nothing.
export function SegmentedSearchBar({ city, category, onCityChange, onCategoryChange }) {
  const [active, setActive] = useState('location');
  const segment = SEGMENTS.find((s) => s.key === active);

  const value = active === 'location' ? city : active === 'cuisine' ? category : '';

  function handleChange(e) {
    if (active === 'location') onCityChange(e.target.value);
    if (active === 'cuisine') onCategoryChange(e.target.value);
  }

  return (
    <div className="search-bar">
      <div className="search-bar__tabs" role="tablist" aria-label="Search by">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={active === s.key}
            className={`search-bar__tab ${active === s.key ? 'search-bar__tab--active' : ''}`}
            onClick={() => setActive(s.key)}
            disabled={s.disabled}
            title={s.disabled ? 'Coming soon - needs follows + real auth' : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={segment.placeholder}
        disabled={segment.disabled}
      />
    </div>
  );
}
