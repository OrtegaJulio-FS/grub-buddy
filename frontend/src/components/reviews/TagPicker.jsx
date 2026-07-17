import { REVIEW_TAGS } from '../../lib/tags';
import './TagPicker.css';

export function TagPicker({ selected, onChange }) {
  function toggle(tag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="tag-picker" role="group" aria-label="Tags">
      {REVIEW_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`tag-picker__chip ${active ? 'tag-picker__chip--active' : ''}`}
            aria-pressed={active}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
