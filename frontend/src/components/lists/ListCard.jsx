import { Link } from 'react-router-dom';
import './ListCard.css';

export function ListCard({ list }) {
  return (
    <Link to={`/lists/${list.id}`} className="list-card">
      <div className="list-card__header">
        <h3 className="list-card__title">{list.title}</h3>
        <span className={`list-card__badge ${list.is_public ? '' : 'list-card__badge--private'}`}>
          {list.is_public ? 'Public' : 'Private'}
        </span>
      </div>
      {list.description && <p className="list-card__description">{list.description}</p>}
    </Link>
  );
}
