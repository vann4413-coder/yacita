'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth';
import type { AuthUser } from '@yacita/types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const SERVICES_OPTIONS = ['FISIO', 'MASAJE', 'QUIRO', 'OSTEO', 'PODOLOGIA', 'PSICOLOGIA DEPORTIVA', 'NUTRICION', 'ENTRENAMIENTO PERSONAL'];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') === 'pro' ? 'PRO' : 'BASIC';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    clinicName: '',
    address: '',
    lat: 40.4168,
    lng: -3.7038,
    services: [] as string[],
    description: '',
    photos: [] as string[],
  });

  function update(field: keyof typeof form, value: string | number | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setForm((f) => ({ ...f, photos: [base64] }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.services.length === 0) { setError('Selecciona al menos un servicio.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: { id: string; email: string; name: string; role: string }; clinicId: string }>(
        '/auth/clinic',
        form,
      );
      localStorage.setItem('yacita_token', data.token);
      useAuthStore.setState({ user: data.user as AuthUser, token: data.token, clinicId: data.clinicId });
      if (initialPlan !== 'BASIC') {
        router.push('/clinic/billing');
      } else {
        router.push('/clinic/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear la cuenta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bgdark flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold font-heading text-white">Yacita</h1>
          <p className="text-[#A0D9C4] font-body mt-1">Registra tu clinica</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-modal p-8 flex flex-col gap-5 shadow-card">
          <div className="flex gap-2 mb-2">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold font-heading text-ytext">Tu cuenta</h2>
              <Input id="name" label="Tu nombre" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Carlos Ruiz" required />
              <Input id="email" label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@clinica.com" type="email" required />
              <div className="relative">
                <Input id="password" label="Contrasena" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 8 caracteres" type={showPassword ? 'text' : 'password'} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <Button type="button" fullWidth size="lg" onClick={() => { if (!form.name || !form.email || !form.password) { setError('Rellena todos los campos.'); return; } setError(''); setStep(2); }}>
                Continuar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold font-heading text-ytext">Tu clinica</h2>
              <Input id="clinicName" label="Nombre de la clinica" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)} placeholder="FisioGram Madrid" required />
              <Input id="address" label="Direccion" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Calle Gran Via 42, Madrid" required />
              <Input id="description" label="Descripcion (opcional)" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Especialistas en..." />

              <div>
                <p className="text-sm font-semibold text-gray-600 font-body mb-2">Foto de la clinica (opcional)</p>
                {photoPreview && (
                  <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2" />
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-500 font-body" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 font-body mb-2">Servicios que ofreces</p>
                <div className="flex gap-2 flex-wrap">
                  {SERVICES_OPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={`rounded-pill px-4 py-2 text-sm font-semibold font-body border-2 transition-colors ${form.services.includes(s) ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 font-body bg-red-50 rounded-pill px-4 py-2">{error}</p>}

              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 accent-[#1B4332]" />
                  <span className="text-xs text-gray-500 font-body">
                    He leido y acepto los{' '}
                    <a href="/terminos" target="_blank" className="text-[#1B4332] font-semibold underline">Terminos y Condiciones</a>
                    {' '}y la{' '}
                    <a href="/privacidad" target="_blank" className="text-[#1B4332] font-semibold underline">Politica de Privacidad</a>
                    {' '}de Yacita. *
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 accent-[#1B4332]" />
                  <span className="text-xs text-gray-500 font-body">
                    Confirmo que dispongo de las titulaciones y habilitaciones legales necesarias para ejercer mi actividad profesional. *
                  </span>
                </label>
                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" fullWidth onClick={() => setStep(1)}>Volver</Button>
                  <Button type="submit" fullWidth size="lg" loading={loading}>Crear mi clinica</Button>
                </div>
              </div>
            </>
          )}

          {step === 1 && error && <p className="text-sm text-red-500 font-body bg-red-50 rounded-pill px-4 py-2">{error}</p>}

          <p className="text-center text-sm font-body text-gray-500">
            Ya tienes cuenta?{' '}
            <a href="/clinic/login" className="text-primary font-semibold hover:underline">Acceder</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ClinicRegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
