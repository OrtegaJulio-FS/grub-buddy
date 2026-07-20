import { ApiError } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Bypasses the shared JSON-only `api` client - file uploads need a
// multipart/form-data body, which the browser sets the boundary for itself
// as long as we don't set Content-Type manually.
export async function uploadImage(file, folder = 'avatars') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetch(new URL('/uploads', API_URL), {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error || `Upload failed with status ${res.status}`, res.status);
  }

  return data;
}
