import { create } from 'zustand';
import type { CurrentUser } from '../types/auth.types';
import { getCurrentUser, logout as logoutService } from '../services/auth.service';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<CurrentUser | null>;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  fetchUser: async () => {
    console.log("fetchUser in auth.store.ts called");
    try {
      const user = await getCurrentUser();
      console.log("fetchUser got user:", user);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      console.error("fetchUser error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
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
