'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/stores/uiStore';
import AuthLayout from '@/components/auth/AuthLayout';
import Spinner from '@/components/Spinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-14 h-14 text-brand-lime mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-brand-charcoal uppercase">Check your email</h3>
          <p className="text-sm text-gray-500 mt-2">If an account exists for {email}, a password reset link has been sent.</p>
          <Link href="/login" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-charcoal text-white font-bold text-sm rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner className="w-4 h-4 border-white/30 border-t-white" />}
            Send Reset Link
          </button>
          <p className="text-sm text-gray-500 text-center">
            Remember your password?{' '}
            <Link href="/login" className="font-bold text-brand-charcoal hover:text-brand-lime-hover">Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
