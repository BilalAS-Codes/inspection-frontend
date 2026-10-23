const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Standard HTTP fetch client with cookie credentials and structured error handling.
 *
 * @param {string} endpoint - API path (e.g. '/api/auth/me')
 * @param {RequestInit & { headers?: Record<string, string> }} [options]
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Retrieve JWT token from localStorage if available (supports network IP and cross-origin access)
  let token = null;
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('invertio_token');
    } catch {
      // Ignore storage access errors
    }
  }

  const defaultHeaders = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let errorData = { code: 'UNKNOWN_ERROR', message: `Request failed with status ${response.status}`, details: {} };
    if (contentType.includes('application/json')) {
      try {
        const json = await response.json();
        if (json.error) {
          errorData = json.error;
        }
      } catch (e) {
        // Fallback
      }
    }
    const err = new Error(errorData.message || 'API request failed');
    err.status = response.status;
    err.code = errorData.code;
    err.details = errorData.details || {};
    throw err;
  }

  if (options.responseType === 'blob' || contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
    return await response.blob();
  }

  if (contentType.includes('application/json')) {
    return await response.json();
  }

  if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
    if (options.responseType === 'blob') {
      return await response.blob();
    }
    return await response.text();
  }

  return response;
}
