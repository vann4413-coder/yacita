import Link from 'next/link';
import { clsx } from 'clsx';

const PLANS = [
  {
    name: 'Paciente',
    price: 'Gratis',
    period: 'siempre',
    highlight: false,
    badge: null,
    description: 'Para quienes buscan cita de última hora con descuento.',
    cta: 'Descargar la app',
    ctaHref: '#',
    ctaVariant: 'outline' as const,
    features: [
      'Acceso a todos los huecos cercanos',
      'Reservas ilimitadas',
      'Notificaciones de huecos nuevos',
      'Recordatorio 1h antes',
      'Sin tarjeta de crédito',
    ],
  },
  {
    name: 'Plan Básico',
    price: '5,99€',
    period: '/mes',
    highlight: false,
    badge: null,
    description: 'Para clínicas que empiezan con Yacita.',
    cta: 'Empezar gratis 14 días',
    ctaHref: '/clinic/register?plan=basic',
    ctaVariant: 'primary' as const,
    features: [
      'Hasta 10 huecos por mes',
      'Reservas ilimitadas de pacientes',
      'Panel de gestión web',
      'Notificaciones de nuevas reservas',
      'Soporte por email',
    ],
  },
  {
    name: 'Plan Pro',
    price: '14,99€',
    period: '/mes',
    highlight: true,
    badge: 'Más popular',
    description: 'Para clínicas que quieren maximizar su ocupación.',
    cta: 'Empezar gratis 14 días',
    ctaHref: '/clinic/register?plan=pro',
    ctaVariant: 'cta' as const,
    features: [
      'Huecos ilimitados',
      'Reservas ilimitadas de pacientes',
      'Dashboard con métricas avanzadas',
      'Badge "Verificado" en la app',
      'Notificaciones push avanzadas',
      'Soporte prioritario',
    ],
  },
] as const;

export function PricingSection() {
  return (
    <section id="precios" className="py-24 bg-bgsoft">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-heading text-ytext mb-4">
            Precios transparentes
          </h2>
          <p className="text-gray-500 font-body text-lg max-w-xl mx-auto">
            Los pacientes siempre gratis. Las clínicas pagan una cuota fija mensual, sin comisiones
            por reserva.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={clsx(
                'rounded-card bg-white p-8 flex flex-col gap-6 relative',
                plan.highlight ? 'shadow-card ring-2 ring-primary' : 'shadow-soft',
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold font-body rounded-full px-4 py-1">
                  {plan.badge}
                </span>
              )}

              <div>
                <p className="text-sm font-semibold font-body text-gray-400 uppercase tracking-wide mb-1">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-heading text-ytext">{plan.price}</span>
                  {plan.period !== 'siempre' && (
                    <span className="text-sm font-body text-gray-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm font-body text-gray-500 mt-2">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-body text-gray-600">
                    <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={clsx(
                  'w-full text-center rounded-pill px-6 py-3 text-sm font-semibold font-body transition-opacity hover:opacity-90',
                  plan.ctaVariant === 'cta'     && 'bg-cta text-white',
                  plan.ctaVariant === 'primary'  && 'bg-primary text-white',
                  plan.ctaVariant === 'outline'  && 'border-2 border-primary text-primary hover:bg-bgsoft',
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm font-body text-gray-400 mt-8">
          Sin permanencia · Cancela cuando quieras · IVA incluido
        </p>
      </div>
    </section>
  );
}
