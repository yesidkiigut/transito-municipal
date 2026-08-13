import axios from 'axios';

// URL del backend configurada en variables de entorno o producción
const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

// Configurar axios por defecto
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

// Configurar interceptor global de fetch para que cualquier llamada a /api/... use el backend de Railway
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string' && input.startsWith('/api') && API_BASE_URL) {
    input = `${API_BASE_URL}${input}`;
  } else if (input instanceof URL && input.pathname.startsWith('/api') && API_BASE_URL) {
    input = new URL(`${API_BASE_URL}${input.pathname}${input.search}`);
  }
  return originalFetch(input, init);
};
