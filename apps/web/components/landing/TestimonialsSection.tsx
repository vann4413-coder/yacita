const TESTIMONIALS = [
  {
    name: 'Laura Martínez',
    role: 'Fisioterapeuta · Madrid',
    avatar: 'LM',
    quote:
      'Antes perdía 3 o 4 huecos a la semana por cancelaciones de última hora. Con Yacita los lleno en menos de una hora. El Plan Pro se paga solo en el primer mes.',
    stars: 5,
  },
  {
    name: 'Carlos Ruiz',
    role: 'Quiropráctico · Barcelona',
    avatar: 'CR',
    quote:
      'La app es increíblemente sencilla. Mis pacientes me lo agradecen porque se ahorran entre 15 y 20€ por sesión, y yo no pierdo ingresos. Win-win total.',
    stars: 5,
  },
  {
    name: 'Ana García',
    role: 'Paciente · Sevilla',
    avatar: 'AG',
    quote:
      'Encontré un masaje para esa misma tarde con un 35% de descuento. La reserva tardó menos de 2 minutos. Nunca más buscaré cita de otra manera.',
    stars: 5,
  },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">★</span>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-heading text-ytext mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-gray-500 font-body text-lg max-w-lg mx-auto">
            Clínicas que llenan su agenda y pacientes que ahorran. Eso es Yacita.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-bgsoft rounded-card p-7 flex flex-col gap-5">
              <Stars count={t.stars} />
              <p className="text-gray-700 font-body text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold font-body shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold font-body text-ytext">{t.name}</p>
                  <p className="text-xs font-body text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
