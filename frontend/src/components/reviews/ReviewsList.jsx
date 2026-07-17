import { ReviewCard } from './ReviewCard';
import './ReviewsList.css';

// Most-recent-first for now; switch to friends-first once /follows exists (Phase 5).
function byMostRecent(a, b) {
  return new Date(b.visited_at) - new Date(a.visited_at);
}

export function ReviewsList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="reviews-list__empty">
        <p>No reviews yet — be the first to write one.</p>
      </div>
    );
  }

  const sorted = [...reviews].sort(byMostRecent);

  return (
    <ul className="reviews-list">
      {sorted.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </ul>
  );
}
