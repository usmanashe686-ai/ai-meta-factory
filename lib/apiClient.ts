import { API_BASE_URL } from "@/lib/apiConfig";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  return res;
}

export default apiFetch;
