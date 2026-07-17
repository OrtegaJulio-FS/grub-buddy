import { api } from './client';

export function listActivity() {
  return api.get('/activity');
}
