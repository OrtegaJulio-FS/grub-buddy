import { ActivityItem } from './ActivityItem';
import './ActivityFeed.css';

export function ActivityFeed({ activity }) {
  if (activity.length === 0) {
    return (
      <div className="activity-feed__empty">
        <p>No activity yet. Follow people to see their logs and reviews here.</p>
      </div>
    );
  }

  return (
    <ul className="activity-feed">
      {activity.map((item) => (
        <ActivityItem key={`${item.type}-${item.id}`} item={item} />
      ))}
    </ul>
  );
}
