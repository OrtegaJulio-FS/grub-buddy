import { ReviewCard } from './ReviewCard';
import './ReviewsList.css';

function byMostRecent(a, b) {
  return new Date(b.visited_at) - new Date(a.visited_at);
}

// Friends-first: reviews from the current user or anyone they follow sort
// ahead of everyone else's, most-recent-first within each group.
function rankReviews(reviews, friendIds) {
  const friends = [];
  const others = [];
  for (const review of reviews) {
    (friendIds.has(String(review.user_id)) ? friends : others).push(review);
  }
  return [...friends.sort(byMostRecent), ...others.sort(byMostRecent)];
}

export function ReviewsList({ reviews, friendIds }) {
  if (reviews.length === 0) {
    return (
      <div className="reviews-list__empty">
        <p>No reviews yet — be the first to write one.</p>
      </div>
    );
  }

  const sorted = rankReviews(reviews, friendIds);

  return (
    <ul className="reviews-list">
      {sorted.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </ul>
  );
}
