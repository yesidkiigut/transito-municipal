import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'FUNCIONARIO' | 'CIUDADANO';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Load initial state from localStorage if present
const storedUser = localStorage.getItem('transito_user');
const storedToken = localStorage.getItem('transito_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,

  login: (user: User, token: string) => {
    localStorage.setItem('transito_user', JSON.stringify(user));
    localStorage.setItem('transito_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('transito_user');
    localStorage.removeItem('transito_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
