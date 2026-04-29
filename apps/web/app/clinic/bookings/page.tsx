'use client';

import { useState } from 'react';
import { useClinicBookings } from '../../../hooks/useClinic';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatPriceShort, formatShortDate } from '@yacita/utils';
import type { BookingWithDetails } from '@yacita/types';

const STATUS_VARIANT = { CONFIRMED: 'success', CANCELLED: 'neutral', COMPLETED: 'primary' } as const;
const STATUS_LABEL   = { CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', COMPLETED: 'Completada' } as const;

export default function ClinicBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('CONFIRMED');
  const { data, isLoading } = useClinicBookings(page, status);
  const bookings: BookingWithDetails[] = data?.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold font-heading text-ytext mb-6">Reservas recibidas</h1>

      {/* Filtros estado */}
      <div className="flex gap-2 mb-4">
        {['CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-pill px-4 py-1.5 text-sm font-semibold font-body transition-colors ${
              status === s
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {STATUS_LABEL[s as keyof typeof STATUS_LABEL] ?? s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-400 font-body text-sm">No hay reservas con ese estado.</p>
          </div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha cita</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Nota</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-bgsoft transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ytext">{b.user.name}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-ytext">{b.gap.service} · {b.gap.durationMins} min</td>
                  <td className="px-6 py-4 text-ytext">{b.gap.datetime ? formatShortDate(b.gap.datetime) : '—'}</td>
                  <td className="px-6 py-4 font-semibold text-cta">{formatPriceShort(b.gap.discountPrice)}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{b.note ?? '—'}</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={STATUS_LABEL[b.status as keyof typeof STATUS_LABEL] ?? b.status}
                      variant={STATUS_VARIANT[b.status as keyof typeof STATUS_VARIANT] ?? 'neutral'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm font-body text-gray-500">
            <span>{data.total} reservas en total</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
              <Button size="sm" variant="outline" disabled={!data.hasMore} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
