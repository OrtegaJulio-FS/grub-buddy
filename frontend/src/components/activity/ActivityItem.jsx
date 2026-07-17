import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { ForkRating } from '../spots/ForkRating';
import { PlaceholderPhoto } from '../spots/PlaceholderPhoto';
import { formatLogDate } from '../../lib/format';
import './ActivityItem.css';

export function ActivityItem({ item }) {
  const verb = item.type === 'review' ? 'reviewed' : 'logged a visit to';

  return (
    <li className="activity-item">
      <Link to={`/profile/${item.user_id}`}>
        <Avatar name={item.user_name} size="sm" />
      </Link>

      <div className="activity-item__body">
        <div className="activity-item__header">
          <p className="activity-item__headline">
            <Link to={`/profile/${item.user_id}`} className="activity-item__user">
              {item.user_name}
            </Link>{' '}
            {verb}{' '}
            <Link to={`/spots/${item.spot_id}`} className="activity-item__spot">
              {item.spot_name}
            </Link>
          </p>
          <span className="activity-item__date mono">{formatLogDate(item.activity_at)}</span>
        </div>

        <ForkRating average={Number(item.rating)} count={0} size="sm" showCount={false} />

        {item.body && <p className="activity-item__note">{item.body}</p>}

        {item.tags?.length > 0 && (
          <div className="activity-item__tags">
            {item.tags.map((tag) => (
              <span key={tag} className="activity-item__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link to={`/spots/${item.spot_id}`} className="activity-item__thumb">
        {item.spot_cover_photo_url ? (
          <img src={item.spot_cover_photo_url} alt="" />
        ) : (
          <PlaceholderPhoto label={item.spot_name} />
        )}
      </Link>
    </li>
  );
}
