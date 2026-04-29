'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { AuthUser } from '@yacita/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  clinicId: string | null;
  loginClinic: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      clinicId: null,

      loginClinic: async (email, password) => {
        const { data } = await api.post<{ token: string; user: AuthUser; clinicId?: string }>(
          '/auth/login',
          { email, password },
        );
        if (data.user.role !== 'CLINIC_OWNER' && data.user.role !== 'ADMIN') {
          throw new Error('Esta cuenta no es de clínica');
        }
        localStorage.setItem('yacita_token', data.token);
        set({ user: data.user, token: data.token, clinicId: data.clinicId ?? null });
      },

      logout: () => {
        localStorage.removeItem('yacita_token');
        set({ user: null, token: null, clinicId: null });
      },
    }),
    {
      name: 'yacita-clinic-auth',
      partialize: (s) => ({ user: s.user, token: s.token, clinicId: s.clinicId }),
    },
  ),
);
