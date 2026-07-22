import { api } from './client';

export function signup({ name, email, password }) {
  return api.post('/auth/signup', { name, email, password });
}

export function login({ email, password }) {
  return api.post('/auth/login', { email, password });
}

export function logout() {
  return api.post('/auth/logout');
}

export function getCurrentUser() {
  return api.get('/auth/me');
}
