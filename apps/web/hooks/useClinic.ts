'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Clinic, ClinicStats, Gap, BookingWithDetails, PaginatedResponse } from '@yacita/types';

export function useClinicMe() {
  return useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Clinic & { subscription: { plan: string; status: string; currentPeriodEnd: string } | null } }>('/clinic/me');
      return data.data;
    },
  });
}

export function useClinicStats() {
  return useQuery({
    queryKey: ['clinic', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: ClinicStats }>('/clinic/stats');
      return data.data;
    },
    refetchInterval: 60_000,
  });
}

export function useClinicGaps(page = 1, status?: string) {
  return useQuery({
    queryKey: ['clinic', 'gaps', page, status],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Gap>>('/clinic/gaps', {
        params: { page, limit: 20, status },
      });
      return data;
    },
  });
}

export function useClinicBookings(page = 1, status?: string) {
  return useQuery({
    queryKey: ['clinic', 'bookings', page, status],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<BookingWithDetails>>('/clinic/bookings', {
        params: { page, limit: 20, status },
      });
      return data;
    },
  });
}

export function useCreateGap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      datetime: string;
      durationMins: number;
      service: string;
      stdPrice: number;
      discountPrice: number;
      maxBookings: number;
    }) => {
      const { data } = await api.post<{ data: Gap }>('/gaps', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clinic', 'gaps'] });
      qc.invalidateQueries({ queryKey: ['clinic', 'stats'] });
    },
  });
}

export function useDeleteGap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/gaps/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinic', 'gaps'] }),
  });
}
