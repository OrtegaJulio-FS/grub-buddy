import { Link } from 'react-router-dom';
import { ForkRating } from '../spots/ForkRating';
import { PlaceholderPhoto } from '../spots/PlaceholderPhoto';
import { formatLogDate } from '../../lib/format';
import './DiaryList.css';

function byVisitedAtDesc(a, b) {
  return new Date(b.visited_at) - new Date(a.visited_at);
}

export function DiaryList({ logs, spotsById }) {
  const sorted = [...logs].sort(byVisitedAtDesc);

  return (
    <section className="diary-list">
      <h2 className="diary-list__title">Diary</h2>

      {sorted.length === 0 ? (
        <p className="diary-list__empty">No visits logged yet.</p>
      ) : (
        <ol className="diary-list__entries">
          {sorted.map((log) => {
            const spot = spotsById.get(String(log.spot_id));
            return (
              <li key={log.id} className="diary-entry">
                <Link to={`/spots/${log.spot_id}`} className="diary-entry__thumb">
                  {spot?.cover_photo_url ? (
                    <img src={spot.cover_photo_url} alt="" />
                  ) : (
                    <PlaceholderPhoto label={spot?.name || '?'} />
                  )}
                </Link>

                <div className="diary-entry__body">
                  <div className="diary-entry__header">
                    <Link to={`/spots/${log.spot_id}`} className="diary-entry__spot-name">
                      {spot?.name || 'Unknown spot'}
                    </Link>
                    <span className="diary-entry__date mono">{formatLogDate(log.visited_at)}</span>
                  </div>
                  <ForkRating average={Number(log.rating)} count={0} size="sm" showCount={false} />
                  {log.quick_note && <p className="diary-entry__note">{log.quick_note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
