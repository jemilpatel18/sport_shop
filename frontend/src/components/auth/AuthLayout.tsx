'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-brand-charcoal items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop"
          alt="Athlete training"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-brand-lime rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="w-8 h-8 text-brand-charcoal" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white uppercase leading-tight">
            Everything for<br /><span className="text-brand-lime">Every Athlete</span>
          </h2>
          <p className="text-gray-300 mt-4 max-w-sm mx-auto">
            Join SPORTZONE for exclusive drops, member pricing and performance gear.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-brand-charcoal uppercase">{title}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
