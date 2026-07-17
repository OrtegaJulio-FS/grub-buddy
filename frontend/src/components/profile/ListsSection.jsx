import './ListsSection.css';

// No /lists backend yet (the `lists`/`list_items` tables exist but aren't
// exposed through any route), so this is a real empty state rather than
// fake list chips - swap in actual data once the endpoints exist.
export function ListsSection() {
  return (
    <section className="lists-section">
      <h2 className="lists-section__title">Lists</h2>
      <div className="lists-section__placeholder">
        <p>No lists yet — this is coming in a future update.</p>
      </div>
    </section>
  );
}
