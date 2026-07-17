import { useCallback } from 'react';
import { listReviewsForSpot } from '../api/reviews';
import { useAsync } from './useAsync';

export function useReviews(spotId) {
  const fetcher = useCallback(() => listReviewsForSpot(spotId), [spotId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [spotId]);
  return { reviews: data || [], loading, error, refetch };
}
