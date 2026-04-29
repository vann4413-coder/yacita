import Link from 'next/link';

const LINKS = {
  Producto: [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios',       href: '#precios' },
    { label: 'FAQ',           href: '#faq' },
  ],
  Clínicas: [
    { label: 'Registrar mi clínica', href: '/clinic/register' },
    { label: 'Acceder al panel',     href: '/clinic/login' },
    { label: 'Facturación',          href: '/clinic/billing' },
  ],
  Legal: [
    { label: 'Términos de uso',       href: '/legal/terminos' },
    { label: 'Política de privacidad', href: '/legal/privacidad' },
    { label: 'Política de cookies',   href: '/legal/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-bgdark text-[#A0D9C4]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="132" height="36" role="img" aria-label="Yacita logo">
                <rect x="0" y="4" width="52" height="52" rx="12" fill="#1D9E75"/>
                <path d="M11 46 Q26 14 41 46" stroke="#FFFFFF" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
                <circle cx="26" cy="46" r="4.5" fill="#FFFFFF"/>
                <text x="62" y="42" fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" fontWeight="700" fill="#D85A30" letterSpacing="-1">ya</text>
                <text x="108" y="42" fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" fontWeight="700" fill="#FFFFFF" letterSpacing="-1">cita</text>
              </svg>
            </Link>
            <p className="text-sm font-body leading-relaxed text-[#A0D9C4]/80 max-w-xs">
              Marketplace de última hora para el sector salud y bienestar en España.
            </p>
            <div className="flex gap-3 mt-5">
              {['App Store', 'Google Play'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-xs font-semibold font-body bg-white/10 hover:bg-white/20 transition-colors rounded-pill px-3 py-1.5"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold font-body text-white uppercase tracking-widest mb-4">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm font-body hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-[#A0D9C4]/60">
          <p>© {new Date().getFullYear()} Yacita. Todos los derechos reservados.</p>
          <p>
            Hecho con ❤️ en España ·{' '}
            <a href="mailto:hola@yacita.es" className="hover:text-white transition-colors">
              hola@yacita.es
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
