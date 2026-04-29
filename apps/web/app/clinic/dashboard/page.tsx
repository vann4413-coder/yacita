'use client';

import { useClinicStats, useClinicBookings, useClinicMe } from '../../../hooks/useClinic';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { formatPriceShort, formatShortDate } from '@yacita/utils';
import type { BookingWithDetails } from '@yacita/types';

const STATUS_VARIANT = { CONFIRMED: 'success', CANCELLED: 'neutral', COMPLETED: 'primary' } as const;
const STATUS_LABEL   = { CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', COMPLETED: 'Completada' } as const;

export default function DashboardPage() {
  const { data: clinic } = useClinicMe();
  const { data: stats, isLoading: statsLoading } = useClinicStats();
  const { data: bookingsData } = useClinicBookings(1, 'CONFIRMED');
  const bookings: BookingWithDetails[] = bookingsData?.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-ytext">
            {clinic?.name ?? 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-400 font-body mt-0.5">
            {clinic?.subscription
              ? `Plan ${clinic.subscription.plan} · ${clinic.subscription.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}`
              : 'Sin suscripción activa'}
          </p>
        </div>
        <a
          href="/clinic/gaps"
          className="inline-flex items-center gap-2 bg-cta text-white rounded-pill px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Publicar hueco
        </a>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-card bg-white animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Huecos activos"    value={stats.activeGaps}         subtitle={`de ${stats.totalGaps} publicados`} icon="🕐" />
          <StatCard title="Reservas este mes" value={stats.monthlyBookings}    subtitle="confirmadas"                        icon="📅" />
          <StatCard title="Ingresos est. mes" value={formatPriceShort(stats.revenueThisMonth)} subtitle="precio Yacita"     icon="💶" accent="cta" />
          <StatCard title="Ocupación"         value={`${stats.occupancyRate}%`} subtitle="huecos reservados"                icon="📈" />
        </div>
      ) : null}

      {/* Próximas reservas */}
      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold font-heading text-ytext">Próximas reservas confirmadas</h2>
          <a href="/clinic/bookings" className="text-sm text-primary font-semibold hover:underline font-body">
            Ver todas →
          </a>
        </div>

        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-400 font-body text-sm">No hay reservas confirmadas aún.</p>
            <a href="/clinic/gaps" className="text-primary font-semibold text-sm hover:underline font-body mt-2 inline-block">
              Publica tu primer hueco →
            </a>
          </div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-100">
                {['Paciente', 'Servicio', 'Fecha', 'Precio', 'Estado'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.id} className="hover:bg-bgsoft transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ytext">{b.user.name}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-ytext">{b.gap.service} · {b.gap.durationMins} min</td>
                  <td className="px-6 py-4 text-ytext">{b.gap.datetime ? formatShortDate(b.gap.datetime) : '—'}</td>
                  <td className="px-6 py-4 font-semibold text-cta">{formatPriceShort(b.gap.discountPrice)}</td>
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
      </div>
    </div>
  );
}
