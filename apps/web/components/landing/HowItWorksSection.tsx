const CLINIC_STEPS = [
  {
    number: '01',
    icon: '📋',
    title: 'Regístrate gratis',
    desc: 'Crea tu perfil de clínica en 2 minutos. Elige el plan que mejor se adapte a tu volumen.',
  },
  {
    number: '02',
    icon: '🕐',
    title: 'Publica un hueco',
    desc: 'Añade fecha, servicio y precio con descuento. Lo verán cientos de pacientes cercanos al instante.',
  },
  {
    number: '03',
    icon: '💶',
    title: 'Recibe la reserva',
    desc: 'Te notificamos en el momento. El paciente paga directamente en tu centro el día de la cita.',
  },
];

const PATIENT_STEPS = [
  {
    number: '01',
    icon: '📍',
    title: 'Abre la app',
    desc: 'Ve los huecos disponibles cerca de ti en tiempo real, ordenados por distancia y descuento.',
  },
  {
    number: '02',
    icon: '✅',
    title: 'Reserva en segundos',
    desc: 'Sin registro previo necesario. Elige el hueco, confirma y listo. Totalmente gratis.',
  },
  {
    number: '03',
    icon: '🏥',
    title: 'Acude y paga en el centro',
    desc: 'Recibes un recordatorio 1h antes. Paga el precio con descuento directamente en la clínica.',
  },
];

function StepCard({
  step,
}: {
  step: { number: string; icon: string; title: string; desc: string };
}) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {step.icon}
        </div>
      </div>
      <div>
        <span className="text-xs font-bold font-body text-primary uppercase tracking-widest">
          Paso {step.number}
        </span>
        <h3 className="font-bold font-heading text-ytext text-base mt-1 mb-1.5">{step.title}</h3>
        <p className="text-sm font-body text-gray-500 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-heading text-ytext mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-gray-500 font-body text-lg max-w-xl mx-auto">
            Tanto si eres una clínica como si buscas una cita, Yacita es ridículamente fácil de usar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Clínicas */}
          <div>
            <div className="inline-flex items-center gap-2 bg-bgsoft rounded-pill px-4 py-2 mb-8">
              <span className="text-lg">🏥</span>
              <span className="font-bold font-body text-primary text-sm">Para clínicas</span>
            </div>
            <div className="flex flex-col gap-8">
              {CLINIC_STEPS.map((s) => <StepCard key={s.number} step={s} />)}
            </div>
          </div>

          {/* Pacientes */}
          <div>
            <div className="inline-flex items-center gap-2 bg-bgsoft rounded-pill px-4 py-2 mb-8">
              <span className="text-lg">👤</span>
              <span className="font-bold font-body text-primary text-sm">Para pacientes</span>
            </div>
            <div className="flex flex-col gap-8">
              {PATIENT_STEPS.map((s) => <StepCard key={s.number} step={s} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
