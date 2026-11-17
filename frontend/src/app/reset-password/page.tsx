'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/stores/uiStore';
import AuthLayout from '@/components/auth/AuthLayout';
import Spinner from '@/components/Spinner';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid reset link');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successfully');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="New Password" subtitle="Choose a strong new password">
      {done ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-14 h-14 text-brand-lime mx-auto mb-4" />
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-lime" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-lime" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Spinner className="w-4 h-4 border-white/30 border-t-white" />}
            Reset Password
          </button>
          <p className="text-sm text-gray-500 text-center">
            <Link href="/login" className="font-bold text-brand-charcoal hover:text-brand-lime-hover">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Spinner className="w-10 h-10" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
