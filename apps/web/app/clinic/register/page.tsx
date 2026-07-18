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
        router.push(`/clinic/billing`);
      }
