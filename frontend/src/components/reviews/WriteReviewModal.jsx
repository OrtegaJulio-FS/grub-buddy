import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ForkRatingPicker } from '../logs/ForkRatingPicker';
import { VisitStamp } from '../spots/VisitStamp';
import { TagPicker } from './TagPicker';
import { listLogs, updateLog } from '../../api/logs';
import { createReview } from '../../api/reviews';
import { useMutation } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { formatLogDate } from '../../lib/format';
import './WriteReviewModal.css';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mostRecent(logs) {
  return [...logs].sort((a, b) => new Date(b.visited_at) - new Date(a.visited_at))[0];
}

// If the user already has a log for this spot, attaching the review to it
// (rather than always logging a brand new visit) avoids double-counting the
// same visit in log_count/average_rating. The log's rating is kept in sync
// with whatever the review form submits, since they now describe one visit.
async function submitReview({ spotId, existingLog, asNewVisit, visitedAt, rating, body, tags }) {
  if (existingLog && !asNewVisit) {
    await updateLog(existingLog.id, { rating });
    return createReview({ logId: existingLog.id, body, rating, tags });
  }
  return createReview({ spotId, visitedAt, body, rating, tags });
}

export function WriteReviewModal({ open, onClose, spot, onReviewed }) {
  const { user } = useAuth();
  const [visitedAt, setVisitedAt] = useState(today);
  const [rating, setRating] = useState(null);
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [existingLog, setExistingLog] = useState(null);
  const [asNewVisit, setAsNewVisit] = useState(false);
  const { loading, error, mutate } = useMutation(submitReview);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    listLogs({ spotId: spot.id, userId: user.id }).then((logs) => {
      if (cancelled) return;
      if (logs.length > 0) {
        const log = mostRecent(logs);
        setExistingLog(log);
        setRating((current) => current ?? log.rating);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, spot.id, user]);

  function resetAndClose() {
    setVisitedAt(today());
    setRating(null);
    setBody('');
    setTags([]);
    setSubmitted(false);
    setExistingLog(null);
    setAsNewVisit(false);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !body.trim()) return;
    await mutate({ spotId: spot.id, existingLog, asNewVisit, visitedAt, rating, body, tags });
    setSubmitted(true);
    onReviewed?.();
  }

  const attachingToExisting = Boolean(existingLog) && !asNewVisit;

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

          {existingLog && (
            <div className="write-review-form__existing-visit">
              <p>
                You already logged a visit here on {formatLogDate(existingLog.visited_at)} (
                {existingLog.rating} forks). This review will attach to that visit unless you
                say otherwise.
              </p>
              <label className="write-review-form__toggle">
                <input
                  type="checkbox"
                  checked={asNewVisit}
                  onChange={(e) => setAsNewVisit(e.target.checked)}
                />
                <span>This was a new visit</span>
              </label>
            </div>
          )}

          {!attachingToExisting && (
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
          )}

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
