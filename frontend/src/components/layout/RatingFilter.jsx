import './RatingFilter.css';

const OPTIONS = [
  { value: undefined, label: 'Any rating' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

export function RatingFilter({ value, onChange }) {
  return (
    <div className="rating-filter" role="group" aria-label="Minimum rating">
      {OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          className={`rating-filter__option ${value === opt.value ? 'rating-filter__option--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
