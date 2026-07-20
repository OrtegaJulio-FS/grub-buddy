import { api } from './client';

export function getUser(id) {
  return api.get(`/users/${id}`);
}

export function updateUser(id, { name, bio, avatarUrl, city }) {
  return api.put(`/users/${id}`, { name, bio, avatarUrl, city });
}
