import { api } from './client';

export function listFollowers(userId) {
  return api.get(`/users/${userId}/followers`);
}

export function listFollowing(userId) {
  return api.get(`/users/${userId}/following`);
}

export function checkIsFollowing(userId, targetId) {
  return api.get(`/users/${userId}/is-following/${targetId}`);
}

export function followUser(followedId) {
  return api.post('/follows', { followedId });
}

export function unfollowUser(userId) {
  return api.delete(`/follows/${userId}`);
}
