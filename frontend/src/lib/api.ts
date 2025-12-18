import { useAuthStore } from '@/stores/authStore';

// ⭐ Updated: Added the Render URL as a fallback if the Env Var is missing
const RENDER_URL = "https://hr-system-2bau.onrender.com";
const API_BASE_URL = `${import.meta.env.VITE_API_URL || RENDER_URL}/api`;

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const { token } = useAuthStore.getState();
  
  // Ensure we don't double up on slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Server error' }));
    throw new Error(errorData.message || 'An API error occurred.');
  }

  return response.json();
}

export const API = API_BASE_URL;