'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';

export default function SettingsPage() {
  const { user, clinicId } = useAuthStore();
  const [clinic, setClinic] = useState<{ name: string; address: string; description: string; photos: string[] } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (clinicId) {
      api.get(`/clinics/${clinicId}`).then((res) => {
        setClinic(res.data.data);
        if (res.data.data.photos?.[0]) setPhotoPreview(res.data.data.photos[0]);
      }).catch(() => {});
    }
  }, [clinicId]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSavePhoto() {
    if (!photoPreview || !clinicId) return;
    setSaving(true);
    try {
      await api.patch(`/clinics/${clinicId}`, { photos: [photoPreview] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold font-heading text-ytext mb-2">Ajustes</h1>
      <p className="text-sm text-gray-400 font-body mb-8">Gestiona los datos de tu cuenta</p>

      <div className="bg-white rounded-card shadow-soft p-6 flex flex-col gap-5 mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Nombre</p>
          <p className="text-sm font-body text-ytext">{user?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Email</p>
          <p className="text-sm font-body text-ytext">{user?.email ?? '—'}</p>
        </div>
        {clinic && (
          <div>
            <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Clínica</p>
            <p className="text-sm font-body text-ytext">{clinic.name}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-card shadow-soft p-6 flex flex-col gap-4">
        <p className="text-sm font-bold font-heading text-ytext">Foto de la clínica</p>

        {photoPreview ? (
          <img src={photoPreview} alt="Foto clínica" className="w-full h-40 object-cover rounded-xl" />
        ) : (
          <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-body">
            Sin foto
          </div>
        )}

        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-500 font-body" />

        {saved && <p className="text-sm text-green-600 font-body">✓ Foto guardada correctamente</p>}

        <Button onClick={handleSavePhoto} loading={saving} fullWidth>
          Guardar foto
        </Button>
      </div>

      <div className="mt-6 bg-white rounded-card shadow-soft p-6">
        <p className="text-xs text-gray-400 font-body">
          Para modificar otros datos o eliminar tu cuenta contacta con nosotros en{' '}
          <a href="mailto:hola@yacita.es" className="text-primary hover:underline">hola@yacita.es</a>
        </p>
      </div>
    </div>
  );
}
