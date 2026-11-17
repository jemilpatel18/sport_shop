'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import AuthLayout from '@/components/auth/AuthLayout';
import Spinner from '@/components/Spinner';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Name required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success(`Welcome to SPORTZONE, ${user.name}!`);
      router.push('/account');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputCls = (k: string) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-brand-lime ${errors[k] ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <AuthLayout title="Create Account" subtitle="Join SPORTZONE — everything for every athlete">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className={inputCls('name')} />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputCls('email')} />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-lime" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-brand-lime" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" className={inputCls('confirm')} />
          </div>
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading && <Spinner className="w-4 h-4 border-brand-charcoal/30 border-t-brand-charcoal" />}
          Create Account
        </button>
        <p className="text-[11px] text-gray-400 text-center">By creating an account you agree to our Terms of Service & Privacy Policy.</p>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-brand-charcoal hover:text-brand-lime-hover">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
