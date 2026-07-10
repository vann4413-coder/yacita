'use client';

import { useAuthStore } from '../../../store/auth';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold font-heading text-ytext mb-2">Ajustes</h1>
      <p className="text-sm text-gray-400 font-body mb-8">Gestiona los datos de tu cuenta</p>

      <div className="bg-white rounded-card shadow-soft p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Nombre</p>
          <p className="text-sm font-body text-ytext">{user?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Email</p>
          <p className="text-sm font-body text-ytext">{user?.email ?? '—'}</p>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-body">Para modificar tus datos o eliminar tu cuenta contacta con nosotros en <a href="mailto:hola@yacita.es" className="text-primary hover:underline">hola@yacita.es</a></p>
        </div>
      </div>
    </div>
  );
}
