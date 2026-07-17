import { Link } from 'react-router-dom';
import { ForkRating } from './ForkRating';
import { VisitStamp } from './VisitStamp';
import { PlaceholderPhoto } from './PlaceholderPhoto';
import './SpotCard.css';

export function SpotCard({ spot, average, count, loggedByMe }) {
  return (
    <Link to={`/spots/${spot.id}`} className="spot-card">
      <div className="spot-card__photo-wrap">
        {spot.cover_photo_url ? (
          <img className="spot-card__photo" src={spot.cover_photo_url} alt="" />
        ) : (
          <PlaceholderPhoto className="spot-card__photo" label={spot.name} />
        )}
        {loggedByMe && (
          <div className="spot-card__stamp">
            <VisitStamp size="sm" />
          </div>
        )}
      </div>
      <div className="spot-card__body">
        <h3 className="spot-card__name">{spot.name}</h3>
        <div className="spot-card__meta">
          {spot.category && <span className="spot-card__category">{spot.category}</span>}
          {spot.city && <span className="spot-card__city mono">{spot.city}</span>}
        </div>
        <ForkRating average={average} count={count} size="sm" />
      </div>
    </Link>
  );
}
