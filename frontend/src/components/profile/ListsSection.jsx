import { Button } from '../common/Button';
import { ListCard } from '../lists/ListCard';
import './ListsSection.css';

export function ListsSection({ lists, onCreateClick }) {
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

      {lists.length === 0 ? (
        <div className="lists-section__placeholder">
          <p>No lists yet — create your first one to start curating spots.</p>
        </div>
      ) : (
        <div className="lists-section__grid">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </section>
  );
}
