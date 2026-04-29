import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-bgdark min-h-screen flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div>
          <span className="inline-block bg-primary/20 text-primary text-xs font-bold font-body rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            Flash sales de bienestar
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold font-heading text-white leading-tight text-balance mb-6">
            Convierte huecos{' '}
            <span className="text-primary">en citas</span>
          </h1>
          <p className="text-lg font-body text-[#A0D9C4] leading-relaxed mb-10 max-w-lg">
            Yacita conecta clínicas de fisioterapia, masajistas y quiroprácticos con pacientes que
            buscan cita inmediata con descuento. Sin comisiones. Sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/clinic/register"
              className="inline-flex items-center justify-center bg-cta text-white font-semibold font-body rounded-pill px-7 py-4 text-base hover:opacity-90 transition-opacity"
            >
              Soy una clínica →
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center border-2 border-white/20 text-white font-semibold font-body rounded-pill px-7 py-4 text-base hover:border-white/50 transition-colors"
            >
              Busco una cita
            </a>
          </div>

          {/* Social proof rápido */}
          <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
            {[
              { value: '100%', label: 'Gratis para pacientes' },
              { value: '−30%', label: 'Descuento medio' },
              { value: '<2 min', label: 'Para reservar' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold font-heading text-white">{value}</p>
                <p className="text-xs font-body text-[#A0D9C4] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* App mockup — card de hueco */}
        <div className="relative hidden lg:flex justify-center">
          <div className="w-80 bg-white rounded-card shadow-card overflow-hidden">
            {/* Foto placeholder */}
            <div className="h-44 bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
              <span className="text-6xl">🏥</span>
            </div>
            <div className="p-5">
              {/* Badge urgente */}
              <span className="inline-block bg-cta text-white text-xs font-bold font-body rounded-pill px-2.5 py-1 mb-3">
                Hoy 17:00
              </span>
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold font-heading text-ytext text-base">FisioGram Madrid</p>
                <p className="text-xs font-body text-gray-400">A 0,8 km</p>
              </div>
              <p className="text-sm font-body text-gray-500 mb-4">Fisioterapia · 60 min</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-body text-gray-400 line-through">50,00€</span>
                  <span className="text-xl font-extrabold font-heading text-cta">35,00€</span>
                </div>
                <span className="bg-primary text-white text-xs font-bold font-body rounded-pill px-2.5 py-1">
                  −30%
                </span>
              </div>
            </div>
            {/* Botón */}
            <div className="px-5 pb-5">
              <div className="bg-cta text-white text-center font-semibold font-body rounded-pill py-3 text-sm">
                Reservar ahora
              </div>
            </div>
          </div>

          {/* Notif flotante */}
          <div className="absolute -top-4 -right-4 bg-white rounded-card shadow-card px-4 py-3 flex items-center gap-3 w-56">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-xs font-bold font-body text-ytext">Nueva cita reservada</p>
              <p className="text-xs font-body text-gray-400">hace 2 min · FisioGram</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
