import { api } from './client';

export function listReviewsForSpot(spotId) {
  return api.get(`/spots/${spotId}/reviews`);
}

// Either { logId, ... } (attach to an existing log) or
// { spotId, visitedAt, quickNote, ... } (no log yet - backend creates the
// log and review together transactionally). See reviews.controller.js.
export function createReview({ logId, spotId, visitedAt, quickNote, body, rating, tags }) {
  return api.post('/reviews', { logId, spotId, visitedAt, quickNote, body, rating, tags });
}
