import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold font-heading text-white mb-4 text-balance">
          ¿Listo para llenar tu agenda?
        </h2>
        <p className="text-lg font-body text-white/80 mb-10 max-w-xl mx-auto">
          Únete a las clínicas que ya convierten sus huecos vacíos en ingresos. Empieza gratis,
          cancela cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/clinic/register"
            className="inline-flex items-center justify-center bg-white text-primary font-bold font-body rounded-pill px-8 py-4 text-base hover:opacity-90 transition-opacity shadow-card"
          >
            Registra tu clínica gratis →
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center border-2 border-white/40 text-white font-semibold font-body rounded-pill px-8 py-4 text-base hover:border-white transition-colors"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>
    </section>
  );
}
