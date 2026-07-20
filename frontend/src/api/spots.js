import { api } from './client';

export function listSpots({ city, category, minRating, search } = {}) {
  return api.get('/spots', { city, category, minRating, search });
}

export function getSpot(id) {
  return api.get(`/spots/${id}`);
}

export function createSpot(spot) {
  return api.post('/spots', spot);
}
