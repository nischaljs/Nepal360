import { create } from 'zustand';
import type { CurrentUser } from '../types/auth.types';
import { getCurrentUser, logout as logoutService } from '../services/auth.service';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  fetchUser: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    logoutService();
    set({ user: null, isAuthenticated: false });
  },
}));
