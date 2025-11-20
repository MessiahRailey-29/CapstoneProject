// utils/api.ts
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://192.168.1.142:3000';

/**
 * Make an authenticated API request with Clerk JWT token
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  try {
    // Get Clerk session token
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token available. Please sign in.');
    }

    // Add Authorization header with Bearer token
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

/**
 * Helper to make GET requests with authentication
 */
export async function getWithAuth(
  endpoint: string,
  getToken: () => Promise<string | null>
): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'GET' }, getToken);
}

/**
 * Helper to make POST requests with authentication
 */
export async function postWithAuth(
  endpoint: string,
  body: any,
  getToken: () => Promise<string | null>
): Promise<Response> {
  return fetchWithAuth(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * Helper to make PUT requests with authentication
 */
export async function putWithAuth(
  endpoint: string,
  body: any,
  getToken: () => Promise<string | null>
): Promise<Response> {
  return fetchWithAuth(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * Helper to make PATCH requests with authentication
 */
export async function patchWithAuth(
  endpoint: string,
  body?: any,
  getToken?: () => Promise<string | null>
): Promise<Response> {
  return fetchWithAuth(
    endpoint,
    {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    },
    getToken!
  );
}

/**
 * Helper to make DELETE requests with authentication
 */
export async function deleteWithAuth(
  endpoint: string,
  getToken: () => Promise<string | null>
): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'DELETE' }, getToken);
}

export { API_URL };
