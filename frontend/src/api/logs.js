import { api } from './client';

export function listLogs({ userId, spotId } = {}) {
  return api.get('/logs', { userId, spotId });
}

export function createLog({ spotId, rating, visitedAt, quickNote, photoUrl }) {
  return api.post('/logs', { spotId, rating, visitedAt, quickNote, photoUrl });
}
