import './FilterPills.css';

// "Trending" has no real signal from the backend yet (no view/save counts),
// so it's a client-side proxy: clear the category filter and sort the grid by
// log count instead of a real trending endpoint. The rest map straight to
// spots.category values.
export const PILLS = [
  { key: 'trending', label: 'Trending' },
  { key: 'cafe', label: 'Cafés' },
  { key: 'bakery', label: 'Bakeries' },
  { key: 'restaurant', label: 'Restaurants' },
  { key: 'bar', label: 'Bars' },
];

export function FilterPills({ active, onSelect }) {
  return (
    <div className="filter-pills">
      {PILLS.map((pill) => (
        <button
          key={pill.key}
          type="button"
          className={`filter-pill ${active === pill.key ? 'filter-pill--active' : ''}`}
          onClick={() => onSelect(pill.key)}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
