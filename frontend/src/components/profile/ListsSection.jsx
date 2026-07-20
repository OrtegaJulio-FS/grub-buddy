import { Button } from '../common/Button';
import './ListsSection.css';

export function ListsSection({ onCreateClick }) {
  return (
    <section className="lists-section">
      <div className="lists-section__header">
        <h2 className="lists-section__title">Lists</h2>
        {onCreateClick && (
          <Button variant="ghost" size="sm" onClick={onCreateClick}>
            + New list
          </Button>
        )}
      </div>
      <div className="lists-section__placeholder">
        <p>No lists yet — create your first one to start curating spots.</p>
      </div>
    </section>
  );
}
