import { SpotCard } from './SpotCard';
import './SpotGrid.css';

export function SpotGrid({ spots, loggedSpotIds }) {
  if (spots.length === 0) {
    return (
      <div className="spot-grid__empty">
        <p>No spots found. Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="spot-grid">
      {spots.map((spot) => (
        <SpotCard
          key={spot.id}
          spot={spot}
          average={spot.average_rating}
          count={spot.log_count}
          loggedByMe={loggedSpotIds.has(String(spot.id))}
        />
      ))}
    </div>
  );
}
