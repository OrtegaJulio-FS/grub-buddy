import './SegmentedSearchBar.css';

const SEGMENTS = [
  { key: 'location', label: 'Location', placeholder: 'Search by city...' },
  { key: 'cuisine', label: 'Cuisine', placeholder: 'Search by cuisine or category...' },
  { key: 'search', label: 'Search', placeholder: 'Search by name or address...' },
  { key: 'friends', label: 'Trusted by friends', placeholder: 'Showing spots your friends have logged' },
];

// Four-way segmented search: Location and Cuisine map to the exact-match
// `city`/`category` query params; Search maps to a free-text ILIKE across
// name/address/city (see GET /spots's `search` param). "Trusted by friends"
// has no text to type - selecting it just toggles the Feed grid to spots
// logged by people the current user follows (see FeedPage).
export function SegmentedSearchBar({
  active,
  onActiveChange,
  city,
  category,
  search,
  onCityChange,
  onCategoryChange,
  onSearchChange,
}) {
  const segment = SEGMENTS.find((s) => s.key === active);
  const isFriends = active === 'friends';

  const value = active === 'location' ? city : active === 'cuisine' ? category : active === 'search' ? search : '';

  function handleChange(e) {
    if (active === 'location') onCityChange(e.target.value);
    if (active === 'cuisine') onCategoryChange(e.target.value);
    if (active === 'search') onSearchChange(e.target.value);
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
