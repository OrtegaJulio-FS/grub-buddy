import './SegmentedSearchBar.css';

const SEGMENTS = [
  { key: 'location', label: 'Location', placeholder: 'Search by city...' },
  { key: 'cuisine', label: 'Cuisine', placeholder: 'Search by cuisine or category...' },
  { key: 'friends', label: 'Trusted by friends', placeholder: 'Showing spots your friends have logged' },
];

// Three-way segmented search: Location and Cuisine map straight to the
// `city`/`category` query params GET /spots already supports. "Trusted by
// friends" has no text to type - selecting it just toggles the Feed grid to
// spots logged by people the current user follows (see FeedPage).
export function SegmentedSearchBar({ active, onActiveChange, city, category, onCityChange, onCategoryChange }) {
  const segment = SEGMENTS.find((s) => s.key === active);
  const isFriends = active === 'friends';

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
            onClick={() => onActiveChange(s.key)}
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
        disabled={isFriends}
      />
    </div>
  );
}
