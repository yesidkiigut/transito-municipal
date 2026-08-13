import axios from 'axios';

// URL del backend configurada en variables de entorno o producción
let envUrl = (import.meta as any).env?.VITE_API_URL || '';

// Limpiar si el usuario incluyó accidentalmente el nombre de la variable
if (envUrl.includes('=')) {
  envUrl = envUrl.split('=').pop() || '';
}

// Si estamos en producción en Railway y no se definió o es inválida, usar la URL del backend oficial
if (!envUrl && typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
  envUrl = 'https://transito-municipal-production.up.railway.app';
}

export const API_BASE_URL = envUrl.replace(/\/$/, '');

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
