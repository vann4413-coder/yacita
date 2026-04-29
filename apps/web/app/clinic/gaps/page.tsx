'use client';

import { useState } from 'react';
import { useClinicGaps, useCreateGap, useDeleteGap } from '../../../hooks/useClinic';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { formatPriceShort, formatDatetime, calcDiscountPct } from '@yacita/utils';
import type { Gap } from '@yacita/types';

const SERVICES = ['FISIO', 'MASAJE', 'QUIRO', 'OSTEO'];

const GAP_STATUS_VARIANT = {
  AVAILABLE:  'success',
  BOOKED:     'cta',
  CANCELLED:  'neutral',
  COMPLETED:  'primary',
} as const;

const GAP_STATUS_LABEL = {
  AVAILABLE:  'Disponible',
  BOOKED:     'Reservado',
  CANCELLED:  'Cancelado',
  COMPLETED:  'Completado',
} as const;

interface GapForm {
  datetime: string;
  durationMins: number;
  service: string;
  stdPrice: number;
  discountPrice: number;
  maxBookings: number;
}

const EMPTY_FORM: GapForm = {
  datetime: '',
  durationMins: 60,
  service: 'FISIO',
  stdPrice: 50,
  discountPrice: 35,
  maxBookings: 1,
};

export default function GapsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GapForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const { data, isLoading, refetch } = useClinicGaps(page, statusFilter || undefined);
  const { mutateAsync: createGap, isPending: creating } = useCreateGap();
  const { mutateAsync: deleteGap } = useDeleteGap();

  const gaps: (Gap & { confirmedBookings?: number; discountPct?: number })[] = data?.data ?? [];

  function updateForm(field: keyof GapForm, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.datetime) { setFormError('La fecha es obligatoria.'); return; }
    if (form.discountPrice >= form.stdPrice) {
      setFormError('El precio con descuento debe ser menor al precio estándar.');
      return;
    }

    try {
      await createGap({
        ...form,
        datetime: new Date(form.datetime).toISOString(),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo crear el hueco.';
      setFormError(msg);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Cancelar este hueco? Se cancelarán también sus reservas.')) return;
    await deleteGap(id);
  }

  const discountPreview = form.stdPrice > 0
    ? calcDiscountPct(form.stdPrice, form.discountPrice)
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-ytext">Mis huecos</h1>
          <p className="text-sm text-gray-400 font-body mt-0.5">Gestiona los huecos disponibles de tu clínica</p>
        </div>
        <Button variant="cta" onClick={() => setShowForm(true)}>+ Nuevo hueco</Button>
      </div>

      {/* Modal: formulario nuevo hueco */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-modal shadow-card w-full max-w-lg p-8">
            <h2 className="text-lg font-bold font-heading text-ytext mb-6">Publicar nuevo hueco</h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {/* Fecha y hora */}
              <Input
                label="Fecha y hora"
                type="datetime-local"
                id="datetime"
                value={form.datetime}
                onChange={(e) => updateForm('datetime', e.target.value)}
                required
              />

              {/* Servicio + duración */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 font-body">Servicio</label>
                  <select
                    value={form.service}
                    onChange={(e) => updateForm('service', e.target.value)}
                    className="rounded-pill border border-gray-200 bg-bgsoft px-4 py-2.5 text-sm font-body text-ytext focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Input
                  label="Duración (min)"
                  type="number"
                  id="duration"
                  min={15}
                  max={480}
                  step={15}
                  value={form.durationMins}
                  onChange={(e) => updateForm('durationMins', parseInt(e.target.value))}
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Precio estándar (€)"
                  type="number"
                  id="stdPrice"
                  min={1}
                  step={0.5}
                  value={form.stdPrice}
                  onChange={(e) => updateForm('stdPrice', parseFloat(e.target.value))}
                />
                <Input
                  label="Precio Yacita (€)"
                  type="number"
                  id="discountPrice"
                  min={1}
                  step={0.5}
                  value={form.discountPrice}
                  onChange={(e) => updateForm('discountPrice', parseFloat(e.target.value))}
                />
              </div>

              {/* Preview descuento */}
              {discountPreview > 0 && (
                <div className="bg-bgsoft rounded-pill px-4 py-2 flex items-center gap-2 text-sm font-body">
                  <span className="text-primary font-semibold">-{discountPreview}% de descuento</span>
                  <span className="text-gray-400">· El paciente ahorra {formatPriceShort(form.stdPrice - form.discountPrice)}</span>
                </div>
              )}

              {/* Plazas */}
              <Input
                label="Plazas máximas"
                type="number"
                id="maxBookings"
                min={1}
                max={10}
                value={form.maxBookings}
                onChange={(e) => updateForm('maxBookings', parseInt(e.target.value))}
              />

              {formError && (
                <p className="text-sm text-red-500 font-body bg-red-50 rounded-pill px-4 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="cta" fullWidth loading={creating}>
                  Publicar hueco
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['', 'AVAILABLE', 'BOOKED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-pill px-4 py-1.5 text-sm font-semibold font-body transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {s === '' ? 'Todos' : GAP_STATUS_LABEL[s as keyof typeof GAP_STATUS_LABEL] ?? s}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : gaps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🕐</p>
            <p className="text-gray-400 font-body text-sm mb-4">No tienes huecos publicados aún.</p>
            <Button variant="cta" onClick={() => setShowForm(true)}>Publicar mi primer hueco</Button>
          </div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Dto.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Reservas</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gaps.map((g) => (
                <tr key={g.id} className="hover:bg-bgsoft transition-colors">
                  <td className="px-6 py-4 font-medium text-ytext">{g.service} · {g.durationMins} min</td>
                  <td className="px-6 py-4 text-ytext">{formatDatetime(g.datetime)}</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-gray-400 mr-2">{formatPriceShort(g.stdPrice)}</span>
                    <span className="font-semibold text-cta">{formatPriceShort(g.discountPrice)}</span>
                  </td>
                  <td className="px-6 py-4 text-primary font-semibold">
                    {g.discountPct !== undefined ? `-${g.discountPct}%` : `${calcDiscountPct(g.stdPrice, g.discountPrice)}%`}
                  </td>
                  <td className="px-6 py-4 text-ytext">
                    {g.confirmedBookings ?? 0} / {g.maxBookings}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={GAP_STATUS_LABEL[g.status as keyof typeof GAP_STATUS_LABEL] ?? g.status}
                      variant={GAP_STATUS_VARIANT[g.status as keyof typeof GAP_STATUS_VARIANT] ?? 'neutral'}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {g.status === 'AVAILABLE' && (
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm font-body text-gray-500">
            <span>{data.total} huecos en total</span>
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
