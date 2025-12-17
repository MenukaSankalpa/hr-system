// import { useAuthStore } from '@/stores/authStore';

// //const API_BASE_URL = 'http://localhost:4000/api';
// const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// //const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// // Utility function for making authenticated API calls
// export async function authenticatedFetch(
//     endpoint: string,
//     options: RequestInit = {}
// ) {
//     const { token } = useAuthStore.getState();
//     const headers = {
//         'Content-Type': 'application/json',
//         ...options.headers,
//     };

//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         headers,
//     });

//     if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Server error' }));
//         throw new Error(errorData.message || 'An API error occurred.');
//     }

//     return response.json();
// }

import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Utility function for making authenticated API calls
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const { token } = useAuthStore.getState();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Server error' }));
    throw new Error(errorData.message || 'An API error occurred.');
  }

  return response.json();
}

export const API = API_BASE_URL; // For static URLs like CV file download
