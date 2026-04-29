import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { GapWithClinic, GapFilters, PaginatedResponse } from '@yacita/types';

export function useGaps(filters: GapFilters) {
  return useQuery({
    queryKey: ['gaps', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<GapWithClinic>>('/gaps', {
        params: filters,
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useGap(id: string) {
  return useQuery({
    queryKey: ['gap', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: GapWithClinic & { spotsLeft: number; savings: number } }>(`/gaps/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { gapId: string; note?: string }) => {
      const { data } = await api.post('/bookings', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gaps'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/me');
      return data;
    },
  });
}
