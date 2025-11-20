// utils/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://192.168.1.142:3000';

/**
 * Make an API request (no authentication required)
 */
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Helper to make GET requests
 */
export async function getWithAuth(
  endpoint: string,
  _getToken?: () => Promise<string | null> // Keep parameter for compatibility but don't use it
): Promise<Response> {
  return apiFetch(endpoint, { method: 'GET' });
}

/**
 * Helper to make POST requests
 */
export async function postWithAuth(
  endpoint: string,
  body: any,
  _getToken?: () => Promise<string | null> // Keep parameter for compatibility but don't use it
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Helper to make PUT requests
 */
export async function putWithAuth(
  endpoint: string,
  body: any,
  _getToken?: () => Promise<string | null> // Keep parameter for compatibility but don't use it
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Helper to make PATCH requests
 */
export async function patchWithAuth(
  endpoint: string,
  body?: any,
  _getToken?: () => Promise<string | null> // Keep parameter for compatibility but don't use it
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper to make DELETE requests
 */
export async function deleteWithAuth(
  endpoint: string,
  _getToken?: () => Promise<string | null> // Keep parameter for compatibility but don't use it
): Promise<Response> {
  return apiFetch(endpoint, { method: 'DELETE' });
}

export { API_URL };
