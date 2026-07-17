import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { ForkRating } from '../spots/ForkRating';
import { formatLogDate } from '../../lib/format';
import './ReviewCard.css';

export function ReviewCard({ review }) {
  return (
    <li className="review-card">
      <Link to={`/profile/${review.user_id}`}>
        <Avatar name={review.user_name} size="sm" />
      </Link>
      <div className="review-card__body">
        <div className="review-card__header">
          <Link to={`/profile/${review.user_id}`} className="review-card__name">
            {review.user_name}
          </Link>
          <span className="review-card__date mono">{formatLogDate(review.visited_at)}</span>
        </div>
        <ForkRating average={Number(review.rating)} count={0} size="sm" showCount={false} />
        <p className="review-card__text">{review.body}</p>
        {review.tags?.length > 0 && (
          <div className="review-card__tags">
            {review.tags.map((tag) => (
              <span key={tag} className="review-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
