import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthState, User } from '@/types';
import { SECURE_KEYS } from '@/constants';
import { authService } from '@/services/auth';

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      const userRaw = await SecureStore.getItemAsync(SECURE_KEYS.USER_DATA);

      if (token && userRaw) {
        const user: User = JSON.parse(userRaw);
        set({ user, accessToken: token, isAuthenticated: true });
      }
    } catch {
      await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.USER_DATA);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const response = await authService.login({ email, password });
    const { user, accessToken, refreshToken } = response.data;

    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(SECURE_KEYS.USER_DATA, JSON.stringify(user));

    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  register: async (email, username, password) => {
    await authService.register({ email, username, password });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {}
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.USER_DATA);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    SecureStore.setItemAsync(SECURE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user });
  },

  clearError: () => {},
}));

export default useAuthStore;
