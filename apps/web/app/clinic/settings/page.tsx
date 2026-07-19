'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    api.get('/clinic/me').then((res) => {
      const clinic = res.data.data;
      setClinicName(clinic.name);
      if (clinic.photos?.[0]) setPhotoPreview(clinic.photos[0]);
    }).catch(() => {});
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('La foto no puede superar 2 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSavePhoto() {
    if (!photoPreview) return;
    setSaving(true);
    setError('');
    try {
      await api.patch('/clinic/me', { photos: [photoPreview] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('No se pudo guardar la foto. Intentalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold font-heading text-ytext mb-2">Ajustes</h1>
      <p className="text-sm text-gray-400 font-body mb-8">Gestiona los datos de tu cuenta</p>

      <div className="bg-white rounded-card shadow-soft p-6 flex flex-col gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Nombre</p>
          <p className="text-sm font-body text-ytext">{user?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Email</p>
          <p className="text-sm font-body text-ytext">{user?.email ?? '—'}</p>
        </div>
        {clinicName && (
          <div>
            <p className="text-xs font-semibold text-gray-400 font-body uppercase tracking-wide mb-1">Clinica</p>
            <p className="text-sm font-body text-ytext">{clinicName}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-card shadow-soft p-6 flex flex-col gap-4 mb-6">
        <div>
          <p className="text-sm font-bold font-heading text-ytext mb-1">Foto de la clinica</p>
          <p className="text-xs text-gray-400 font-body mb-3">
            Sube una foto de tu clinica o consulta. Formato JPG o PNG, maximo 2 MB. Recomendado: horizontal, minimo 800x600px.
          </p>
        </div>

        {photoPreview ? (
          <img src={photoPreview} alt="Foto clinica" className="w-full h-48 object-cover rounded-xl" />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-body border-2 border-dashed border-gray-200">
            Sin foto — sube una imagen de tu clinica
          </div>
        )}

        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="text-sm text-gray-500 font-body" />

        {error && <p className="text-sm text-red-500 font-body">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-body">Foto guardada correctamente</p>}

        <Button onClick={handleSavePhoto} loading={saving} fullWidth>
          Guardar foto
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-soft p-6">
        <p className="text-xs text-gray-400 font-body">
          Para modificar otros datos o eliminar tu cuenta contacta con nosotros en{' '}
          <a href="mailto:hola@yacita.health" className="text-primary hover:underline">hola@yacita.health</a>
        </p>
      </div>
    </div>
  );
}
