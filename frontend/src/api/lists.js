import { api } from './client';

export function createList({ title, description, isPublic }) {
  return api.post('/lists', { title, description, isPublic });
}

export function getList(id) {
  return api.get(`/lists/${id}`);
}

export function addListItem(listId, spotId) {
  return api.post(`/lists/${listId}/items`, { spotId });
}

export function removeListItem(listId, spotId) {
  return api.delete(`/lists/${listId}/items/${spotId}`);
}

export function listUserLists(userId) {
  return api.get(`/users/${userId}/lists`);
}
