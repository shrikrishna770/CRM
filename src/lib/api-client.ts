export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'API Request Failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}
