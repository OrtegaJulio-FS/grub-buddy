import { SpotCard } from './SpotCard';
import './SpotGrid.css';

export function SpotGrid({ spots, statsBySpot, loggedSpotIds }) {
  if (spots.length === 0) {
    return (
      <div className="spot-grid__empty">
        <p>No spots found. Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="spot-grid">
      {spots.map((spot) => {
        const stats = statsBySpot.get(String(spot.id)) || { average: null, count: 0 };
        return (
          <SpotCard
            key={spot.id}
            spot={spot}
            average={stats.average}
            count={stats.count}
            loggedByMe={loggedSpotIds.has(String(spot.id))}
          />
        );
      })}
    </div>
  );
}
