import Link from 'next/link';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bgdark/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="148" height="40" role="img" aria-label="Yacita logo">
            <rect x="0" y="4" width="52" height="52" rx="12" fill="#1D9E75"/>
            <path d="M11 46 Q26 14 41 46" stroke="#FFFFFF" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
            <circle cx="26" cy="46" r="4.5" fill="#FFFFFF"/>
            <text x="62" y="42" fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" fontWeight="700" fill="#D85A30" letterSpacing="-1">ya</text>
            <text x="108" y="42" fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" fontWeight="700" fill="#FFFFFF" letterSpacing="-1">cita</text>
          </svg>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-body">
          <a href="#como-funciona" className="text-[#A0D9C4] hover:text-white transition-colors">Cómo funciona</a>
          <a href="#precios"        className="text-[#A0D9C4] hover:text-white transition-colors">Precios</a>
          <a href="#faq"            className="text-[#A0D9C4] hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/clinic/login"
            className="text-sm font-semibold font-body text-[#A0D9C4] hover:text-white transition-colors hidden sm:block"
          >
            Acceder
          </Link>
          <Link
            href="/clinic/register"
            className="bg-cta text-white text-sm font-semibold font-body rounded-pill px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Registra tu clínica
          </Link>
        </div>
      </div>
    </header>
  );
}
