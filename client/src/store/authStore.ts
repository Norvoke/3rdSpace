import { create } from 'zustand';
import api from '../utils/api';

export interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  song?: string;
  customCSS?: string;
  customHTML?: string;
  headerImage?: string;
  mood?: string;
  interests?: string[];
  friends: string[];
  friendRequests: string[];
  isPrivate: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  fetchMe: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('3rdspace_token'),
  isLoading: false,
  isAuthenticated: false,

  setToken: (token: string) => {
    localStorage.setItem('3rdspace_token', token);
    set({ token });
  },

  fetchMe: async () => {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token invalid — clear it
      localStorage.removeItem('3rdspace_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('3rdspace_token');
    set({ user: null, token: null, isAuthenticated: false });
    api.post('/auth/logout').catch(() => {});
  },

  updateUser: (updates: Partial<User>) => {
    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
