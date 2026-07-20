'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { api } from '../../../lib/api';

export default function ClinicLoginPage() {
  const router = useRouter();
  const loginClinic = useAuthStore((s) => s.loginClinic);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginClinic(email.trim().toLowerCase(), password);
      router.replace('/clinic/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Credenciales incorrectas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Escribe tu email primero para recuperar la contraseña.');
      return;
    }
    setResetLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email: email.trim().toLowerCase() });
      setResetSent(true);
    } catch {
      setError('No se pudo enviar el email de recuperación. Inténtalo de nuevo.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bgdark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/"><h1 className="text-4xl font-extrabold font-heading text-white">Yacita</h1></a>
          <p className="text-[#79C8C5] font-body mt-1">Panel de clínica</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-modal p-8 flex flex-col gap-5 shadow-card">
          <h2 className="text-xl font-bold font-heading text-ytext">Acceder a mi clínica</h2>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="clinica@ejemplo.com"
            autoComplete="email"
            required
          />
          <div className="relative">
            <Input
              id="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="········"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-sm text-primary font-semibold font-body hover:underline text-right -mt-2"
          >
            {resetLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
          </button>

          {resetSent && (
            <p className="text-sm text-green-600 font-body bg-green-50 rounded-pill px-4 py-2">
              ✓ Te hemos enviado un email para restablecer tu contraseña.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 font-body bg-red-50 rounded-pill px-4 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            Entrar
          </Button>

          <p className="text-center text-sm font-body text-gray-500">
            ¿Aún no tienes cuenta?{' '}
            <a href="/clinic/register" className="text-primary font-semibold hover:underline">
              Registra tu clínica
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

