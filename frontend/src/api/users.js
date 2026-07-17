import { api } from './client';

export function getUser(id) {
  return api.get(`/users/${id}`);
}
