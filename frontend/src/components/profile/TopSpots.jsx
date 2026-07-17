import { SpotCard } from '../spots/SpotCard';
import './TopSpots.css';

// Every entry here comes from the user's own logs, so `loggedByMe` is always
// true - reuses the same SpotCard as the Feed grid, just in a denser layout.
export function TopSpots({ ranked, spotsById }) {
  const top4 = ranked.slice(0, 4);

  return (
    <section className="top-spots">
      <h2 className="top-spots__title">Top spots</h2>
      {top4.length === 0 ? (
        <p className="top-spots__empty">Log a visit to start building your top spots.</p>
      ) : (
        <div className="top-spots__grid">
          {top4.map(({ spotId, average, count }) => {
            const spot = spotsById.get(spotId);
            if (!spot) return null;
            return (
              <SpotCard key={spotId} spot={spot} average={average} count={count} loggedByMe />
            );
          })}
        </div>
      )}
    </section>
  );
}
