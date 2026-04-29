'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/ui/StatCard';
import { clsx } from 'clsx';

type Plan = 'BASIC' | 'PRO';

interface SubscriptionData {
  plan: Plan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodEnd: string;
  cancelAtEnd: boolean;
}

interface ClinicWithSub {
  subscription: SubscriptionData | null;
}

const PLANS = [
  {
    key: 'BASIC' as Plan,
    name: 'Plan Básico',
    price: '5,99€',
    period: '/mes',
    features: [
      'Hasta 10 huecos por mes',
      'Reservas ilimitadas de pacientes',
      'Notificaciones de nuevas reservas',
      'Panel de gestión web',
    ],
    cta: 'Empezar con Básico',
  },
  {
    key: 'PRO' as Plan,
    name: 'Plan Pro',
    price: '14,99€',
    period: '/mes',
    badge: 'Más popular',
    features: [
      'Huecos ilimitados',
      'Reservas ilimitadas de pacientes',
      'Notificaciones push avanzadas',
      'Dashboard con métricas detalladas',
      'Soporte prioritario',
      'Badge "Verificado" en la app',
    ],
    cta: 'Empezar con Pro',
  },
] as const;

const SUB_STATUS_VARIANT = {
  ACTIVE:    'success',
  PAST_DUE:  'warning',
  CANCELLED: 'neutral',
} as const;

const SUB_STATUS_LABEL = {
  ACTIVE:    'Activa',
  PAST_DUE:  'Pago pendiente',
  CANCELLED: 'Cancelada',
} as const;

function BillingContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (searchParams.get('success') === '1')   setToast('¡Suscripción activada correctamente!');
    if (searchParams.get('cancelled') === '1') setToast('El proceso de pago fue cancelado.');
  }, [searchParams]);

  // Cargar datos de clínica/suscripción
  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', 'billing'],
    queryFn: async () => {
      const { data } = await api.get<{ data: ClinicWithSub }>('/clinic/me');
      return data.data;
    },
  });

  // Iniciar checkout
  const { mutateAsync: startCheckout, isPending: checkingOut } = useMutation({
    mutationFn: async (plan: Plan) => {
      const { data } = await api.post<{ data: { url: string } }>('/stripe/checkout', { plan });
      return data.data.url;
    },
    onSuccess: (url) => { window.location.href = url; },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al iniciar el pago.';
      setToast(msg);
    },
  });

  // Abrir Customer Portal
  const { mutateAsync: openPortal, isPending: openingPortal } = useMutation({
    mutationFn: async () => {
      const { data } = await api.get<{ data: { url: string } }>('/stripe/portal');
      return data.data.url;
    },
    onSuccess: (url) => { window.location.href = url; },
    onError: () => setToast('No se pudo abrir el portal de facturación.'),
  });

  const sub = clinic?.subscription;
  const isActive = sub?.status === 'ACTIVE';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            'mb-6 rounded-pill px-5 py-3 text-sm font-semibold font-body',
            toast.includes('activada') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
          )}
        >
          {toast}
          <button className="ml-4 opacity-60 hover:opacity-100" onClick={() => setToast('')}>✕</button>
        </div>
      )}

      <h1 className="text-2xl font-extrabold font-heading text-ytext mb-2">Facturación</h1>
      <p className="text-sm text-gray-400 font-body mb-8">Gestiona tu plan y métodos de pago</p>

      {/* Estado de suscripción actual */}
      {isLoading ? (
        <div className="h-28 rounded-card bg-white animate-pulse mb-8" />
      ) : sub ? (
        <div className="bg-white rounded-card shadow-soft p-6 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-bgsoft flex items-center justify-center text-2xl">
              {sub.plan === 'PRO' ? '⭐' : '✅'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold font-heading text-ytext text-lg">Plan {sub.plan}</span>
                <Badge
                  label={SUB_STATUS_LABEL[sub.status]}
                  variant={SUB_STATUS_VARIANT[sub.status]}
                />
              </div>
              <p className="text-sm text-gray-400 font-body">
                {sub.cancelAtEnd
                  ? `Se cancela el ${new Date(sub.currentPeriodEnd).toLocaleDateString('es-ES')}`
                  : `Renueva el ${new Date(sub.currentPeriodEnd).toLocaleDateString('es-ES')}`}
              </p>
              {sub.status === 'PAST_DUE' && (
                <p className="text-xs text-amber-600 font-body mt-1">
                  ⚠️ Hay un problema con tu método de pago. Actualízalo en el portal.
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            loading={openingPortal}
            onClick={() => openPortal()}
          >
            Gestionar suscripción
          </Button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-5 mb-8 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-body text-amber-800">
            No tienes ningún plan activo. Elige uno abajo para empezar a publicar huecos.
          </p>
        </div>
      )}

      {/* Comparativa de planes */}
      {!isActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={clsx(
                'bg-white rounded-card shadow-soft p-6 flex flex-col gap-4 relative',
                plan.key === 'PRO' && 'ring-2 ring-primary',
              )}
            >
              {'badge' in plan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold font-body rounded-full px-3 py-1">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="font-bold font-heading text-ytext text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold font-heading text-ytext">{plan.price}</span>
                  <span className="text-sm text-gray-400 font-body">{plan.period}</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body text-gray-600">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.key === 'PRO' ? 'cta' : 'primary'}
                fullWidth
                loading={checkingOut}
                onClick={() => startCheckout(plan.key)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Si tiene plan activo → mostrar comparativa solo si quiere cambiar */}
      {isActive && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400 font-body">
            Para cambiar de plan o cancelar, usa el botón{' '}
            <span className="font-semibold text-primary">Gestionar suscripción</span> de arriba.
          </p>
        </div>
      )}

      {/* FAQ precios */}
      <div className="mt-10 bg-white rounded-card shadow-soft p-6">
        <h2 className="font-bold font-heading text-ytext mb-4">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-4 text-sm font-body">
          {[
            ['¿Puedo cancelar en cualquier momento?', 'Sí. La cancelación es inmediata desde el portal y tu plan sigue activo hasta fin del período pagado.'],
            ['¿Cómo se cuenta el límite de huecos del Plan Básico?', 'Se cuentan los huecos no cancelados creados en el mes natural en curso. El contador se reinicia el día 1 de cada mes.'],
            ['¿Los pacientes pagan algo?', 'No. Los pacientes usan Yacita completamente gratis.'],
            ['¿El pago de las citas pasa por Yacita?', 'No. El pago de las citas se gestiona directamente entre clínica y paciente en el momento de la cita.'],
          ].map(([q, a]) => (
            <div key={q}>
              <p className="font-semibold text-ytext">{q}</p>
              <p className="text-gray-500 mt-0.5">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage(): React.JSX.Element {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
