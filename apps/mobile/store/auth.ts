import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import type { AuthUser, LoginDto, RegisterPatientDto } from '@yacita/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterPatientDto) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) { set({ isLoading: false }); return; }
    try {
      const { data } = await api.get<{ data: AuthUser }>('/auth/me');
      set({ user: data.data, token, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      set({ isLoading: false });
    }
  },

  login: async (dto) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', dto);
    await SecureStore.setItemAsync('auth_token', data.token);
    set({ token: data.token, user: data.user });
  },

  register: async (dto) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/register', dto);
    await SecureStore.setItemAsync('auth_token', data.token);
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null });
  },
}));
