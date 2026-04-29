'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/auth';

const NAV = [
  { href: '/clinic/dashboard', label: 'Dashboard',   icon: '📊' },
  { href: '/clinic/gaps',      label: 'Mis huecos',  icon: '🕐' },
  { href: '/clinic/bookings',  label: 'Reservas',    icon: '📅' },
  { href: '/clinic/billing',   label: 'Facturación', icon: '💳' },
  { href: '/clinic/settings',  label: 'Ajustes',     icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/clinic/login');
  }

  return (
    <aside className="w-60 shrink-0 bg-bgdark flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-2xl font-extrabold font-heading text-white">Yacita</span>
        <p className="text-xs text-[#A0D9C4] font-body mt-0.5">Panel de clínica</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-body font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary text-white'
                : 'text-[#A0D9C4] hover:bg-white/10 hover:text-white',
            )}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer: usuario */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate font-body">{user?.name}</p>
          <p className="text-xs text-[#A0D9C4] truncate font-body">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#A0D9C4] hover:text-white transition-colors text-lg"
          title="Cerrar sesión"
        >
          ↩
        </button>
      </div>
    </aside>
  );
}
