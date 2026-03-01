import { API_BASE_URL } from './apiConfig';

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${path}`;
  return fetch(url, options);
}
