'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import AuthLayout from '@/components/auth/AuthLayout';
import Spinner from '@/components/Spinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === 'admin' && redirect === '/account' ? '/admin' : redirect);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  const demoFill = (role: 'customer' | 'admin') => {
    setForm({
      email: role === 'admin' ? 'admin@sportzone.com' : 'alex.athlete@sportzone.com',
      password: 'password123',
    });
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your SPORTZONE account">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-brand-lime ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-charcoal hover:text-brand-lime-hover">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-brand-lime ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading && <Spinner className="w-4 h-4 border-white/30 border-t-white" />}
          Sign In
        </button>
      </form>

      <div className="mt-6 p-4 bg-brand-gray rounded-xl">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Demo accounts (offline mode)</p>
        <div className="flex gap-2">
          <button onClick={() => demoFill('customer')} className="flex-1 text-xs font-semibold py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-lime">Customer</button>
          <button onClick={() => demoFill('admin')} className="flex-1 text-xs font-semibold py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-lime">Admin</button>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-brand-charcoal hover:text-brand-lime-hover">Create one</Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Spinner className="w-10 h-10" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
