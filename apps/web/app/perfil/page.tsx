'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

export default function PerfilPublicoPage() {
  const { clinicId } = useAuthStore();
  const [clinic, setClinic] = useState<{
    name: string;
    address: string;
    description: string;
    photos: string[];
    services: string[];
    verified: boolean;
  } | null>(null);

  useEffect(() => {
    if (clinicId) {
      api.get('/clinics/' + clinicId).then((res) => setClinic(res.data.data)).catch(() => {});
    }
  }, [clinicId]);

  if (!clinic) return <div className="p-8 text-center text-gray-400 font-body">Cargando perfil...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/clinic/settings" className="text-sm text-primary font-semibold font-body hover:underline">← Volver a Ajustes</a>
      </div>

      <div className="bg-white rounded-card shadow-soft overflow-hidden mb-6">
        {clinic.photos?.[0] ? (
          <img src={clinic.photos[0]} alt={clinic.name} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#1B4332] to-[#52b788] flex items-center justify-center">
            <span className="text-5xl font-extrabold text-white">{clinic.name.charAt(0)}</span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-extrabold font-heading text-ytext">{clinic.name}</h1>
            {clinic.verified && (
              <span className="text-xs bg-[#e8f5ee] text-[#1B4332] font-bold px-2 py-1 rounded-full">Verificado</span>
            )}
          </div>

          <p className="text-sm text-gray-500 font-body mb-4">📍 {clinic.address}</p>

          {clinic.description && (
            <p className="text-sm text-gray-600 font-body mb-4 leading-relaxed">{clinic.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {clinic.services.map((s) => (
              <span key={s} className="text-xs bg-[#f0f9f4] text-[#1B4332] font-semibold px-3 py-1 rounded-full border border-[#b7e4c7]">
                {s}
              </span>
            ))}
          </div>

          <div className="bg-[#f8fffe] rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 font-body mb-1">Valoracion media</p>
            <div className="text-2xl text-[#f5a623]">★★★★★</div>
            <p className="text-xs text-gray-400 font-body mt-1">Sin valoraciones aun</p>
          </div>
        </div>
      </div>

      <div className="bg-[#fffbf0] border border-[#ffe58a] rounded-xl p-4">
        <p className="text-xs text-[#856404] font-body">
          Asi es como los pacientes ven tu perfil. Para mejorar tu visibilidad, añade una foto y una descripcion desde{' '}
          <a href="/clinic/settings" className="font-semibold underline">Ajustes</a>.
        </p>
      </div>
    </div>
  );
}
