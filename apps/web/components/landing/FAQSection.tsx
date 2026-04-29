'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

const FAQS = [
  {
    q: '¿Yacita cobra comisión por cada reserva?',
    a: 'No. Yacita cobra una cuota mensual fija a las clínicas (5,99€ o 14,99€). Los pacientes usan la plataforma completamente gratis y el pago de las citas se gestiona directamente en el centro.',
  },
  {
    q: '¿Cómo se gestiona el pago de las citas?',
    a: 'El pago de cada cita se realiza directamente entre el paciente y la clínica el día de la visita. Yacita no interviene en ese proceso. Esto evita comisiones y simplifica la gestión para ambas partes.',
  },
  {
    q: '¿Puedo publicar huecos de cualquier tipo de servicio?',
    a: 'Actualmente soportamos fisioterapia, masajes, quiropráctica y osteopatía. Estamos trabajando para ampliar las especialidades próximamente.',
  },
  {
    q: '¿Qué pasa si un paciente no se presenta?',
    a: 'Puedes marcar la reserva como "no presentado" desde el panel de clínica. El hueco queda registrado y puedes contactar al paciente directamente. En el futuro implementaremos un sistema de valoraciones para incentivar la responsabilidad.',
  },
  {
    q: '¿Puedo cancelar mi suscripción en cualquier momento?',
    a: 'Sí, sin permanencia ni penalizaciones. La cancelación se hace desde el portal de facturación de Stripe. Tu plan seguirá activo hasta el final del período ya pagado.',
  },
] as const;

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-bgsoft">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-heading text-ytext mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-500 font-body text-lg">
            ¿Tienes más dudas? Escríbenos a{' '}
            <a href="mailto:hola@yacita.es" className="text-primary font-semibold hover:underline">
              hola@yacita.es
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-card shadow-soft overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold font-body text-ytext text-sm leading-snug">
                  {faq.q}
                </span>
                <span
                  className={clsx(
                    'text-primary text-xl font-bold shrink-0 transition-transform duration-200',
                    open === i && 'rotate-45',
                  )}
                >
                  +
                </span>
              </button>

              <div
                className={clsx(
                  'overflow-hidden transition-all duration-200',
                  open === i ? 'max-h-64' : 'max-h-0',
                )}
              >
                <p className="px-6 pb-5 text-sm font-body text-gray-500 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
