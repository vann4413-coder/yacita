'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth';
import type { AuthUser } from '@yacita/types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERVICES_OPTIONS = ['FISIO', 'MASAJE', 'QUIRO', 'OSTEO', 'PODOLOGIA', 'PSICOLOGIA DEPORTIVA', 'NUTRICION', 'ENTRENAMIENTO PERSONAL'];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') === 'pro' ? 'PRO' : 'BASIC';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.services.length === 0) { setError('Selecciona al menos un servicio.'); return; }
    setError('');
    setLoading(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage
          .from('clinic-photos')
          .upload(fileName, photoFile, { upsert: true });
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('clinic-photos')
            .getPublicUrl(uploadData.path);
          photoUrl = urlData.publicUrl;
        }
      }
      const { data } = await api.post<{ token: string; user: { id: string; email: string; name: string; role: string }; clinicId: string }>(
        '/auth/clinic',
        { ...form, photos: photoUrl ? [photoUrl] : [] },
      );
      localStorage.setItem('yacita_token', data.token);
      useAuthStore.setState({ user: data.user as AuthUser, token: data.token, clinicId: data.clinicId });
      if (initialPlan !== 'BASIC') {
        router.push(`/clinic/billing`);
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
          <p className="text-[#A0D9C4] font-body mt-1">Registra tu clínica</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-modal p-8 flex flex-col gap-5 shadow-card">
          <div className="flex gap-2 mb-2">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
