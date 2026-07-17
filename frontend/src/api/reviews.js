import { api } from './client';

export function listReviewsForSpot(spotId) {
  return api.get(`/spots/${spotId}/reviews`);
}

export function createReview({ logId, body, rating, tags }) {
  return api.post('/reviews', { logId, body, rating, tags });
}
