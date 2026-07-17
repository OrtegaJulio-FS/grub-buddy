import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ForkRatingPicker } from '../logs/ForkRatingPicker';
import { VisitStamp } from '../spots/VisitStamp';
import { TagPicker } from './TagPicker';
import { createLog } from '../../api/logs';
import { createReview } from '../../api/reviews';
import { useMutation } from '../../hooks/useAsync';
import './WriteReviewModal.css';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// A review needs a log to attach to (reviews.log_id is required + unique),
// so writing one creates the visit log and the review together in one submit
// - a fuller version of the Log-a-Visit flow rather than a separate log picker.
async function submitReview({ spotId, visitedAt, rating, body, tags }) {
  const log = await createLog({ spotId, rating, visitedAt });
  return createReview({ logId: log.id, body, rating, tags });
}

export function WriteReviewModal({ open, onClose, spot, onReviewed }) {
  const [visitedAt, setVisitedAt] = useState(today);
  const [rating, setRating] = useState(null);
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, mutate } = useMutation(submitReview);

  function resetAndClose() {
    setVisitedAt(today());
    setRating(null);
    setBody('');
    setTags([]);
    setSubmitted(false);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !body.trim()) return;
    await mutate({ spotId: spot.id, visitedAt, rating, body, tags });
    setSubmitted(true);
    onReviewed?.();
  }

  return (
    <Modal open={open} onClose={resetAndClose} labelledBy="write-review-heading">
      {submitted ? (
        <div className="write-review-confirm">
          <VisitStamp size="lg" animate />
          <h2 id="write-review-heading" className="write-review-confirm__title">
            Review posted!
          </h2>
          <p className="write-review-confirm__body">
            Your {rating}-fork review of <em>{spot.name}</em> is live.
          </p>
          <Button variant="primary" size="md" onClick={resetAndClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="write-review-form">
          <h2 id="write-review-heading" className="write-review-form__title">
            Write a review for <em>{spot.name}</em>
          </h2>

          <label className="write-review-form__field">
            <span>Date</span>
            <input
              type="date"
              value={visitedAt}
              max={today()}
              onChange={(e) => setVisitedAt(e.target.value)}
              required
            />
          </label>

          <div className="write-review-form__field">
            <span>
              Rating <span className="write-review-form__required">(required)</span>
            </span>
            <ForkRatingPicker value={rating} onChange={setRating} />
          </div>

          <label className="write-review-form__field">
            <span>
              Review <span className="write-review-form__required">(required)</span>
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What made this visit worth writing about?"
              rows={5}
              maxLength={2000}
              required
            />
          </label>

          <div className="write-review-form__field">
            <span>Tags</span>
            <TagPicker selected={tags} onChange={setTags} />
          </div>

          {error && <p className="write-review-form__error">{error.message}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!rating || !body.trim() || loading}
            className="write-review-form__submit"
          >
            {loading ? 'Posting...' : 'Post review'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
