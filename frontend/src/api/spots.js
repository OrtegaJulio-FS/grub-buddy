import { api } from './client';

export function listSpots({ city, category } = {}) {
  return api.get('/spots', { city, category });
}

export function getSpot(id) {
  return api.get(`/spots/${id}`);
}

export function createSpot(spot) {
  return api.post('/spots', spot);
}
