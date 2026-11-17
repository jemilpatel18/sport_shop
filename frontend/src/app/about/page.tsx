'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Target, Eye, Heart, Trophy, Users, Award, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const values = [
  { icon: Trophy, title: 'Performance First', desc: 'Every product is vetted for real athletic performance — no gimmicks.' },
  { icon: Heart, title: 'Athlete Community', desc: 'Built by athletes, for athletes. We listen to what competitors actually need.' },
  { icon: Award, title: 'Uncompromising Quality', desc: 'Official partnerships with the world\'s best sports brands.' },
];

const stats = [
  { value: '50K+', label: 'Happy Athletes' },
  { value: '500+', label: 'Products' },
  { value: '25+', label: 'Countries Served' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-charcoal text-white py-20 md:py-28 relative overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000&auto=format&fit=crop" alt="Sports team" fill className="object-cover opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-lime bg-white/10 px-4 py-2 rounded-full mb-5">Our Story</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold uppercase leading-tight">
            Everything For<br /><span className="text-brand-lime">Every Athlete</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mt-6 text-base md:text-lg">
            SPORTZONE was founded with one belief — great athletes deserve great gear. From grassroots to professional, we curate the best sports equipment so you can focus on the game.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-lime py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal">{s.value}</p>
              <p className="text-sm font-semibold text-brand-charcoal/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeading eyebrow="Our Mission" title="Built For Champions" align="left" />
          <p className="text-gray-600 leading-relaxed">
            We started SPORTZONE because finding quality sports gear shouldn't be a scavenger hunt across a dozen unreliable stores. Every product on our platform is sourced from official distributors and tested by real athletes before it earns a spot on our shelves.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Today we serve athletes across cricket, football, badminton, basketball, chess, volleyball, fitness, running and more — with fast delivery, genuine products and prices that respect your passion.
          </p>
          <div className="flex gap-4 mt-8">
            <Link href="/shop" className="px-6 py-3 bg-brand-charcoal text-white font-bold text-sm rounded-xl hover:bg-brand-dark flex items-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="px-6 py-3 border-2 border-brand-charcoal text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-charcoal hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop" alt="Athlete training" fill className="object-cover" />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-8">
            <Image src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop" alt="Team sport" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-gray py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why SPORTZONE" title="Our Values" />
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-card-hover transition-shadow">
                <div className="w-14 h-14 bg-brand-lime rounded-2xl flex items-center justify-center mb-5">
                  <v.icon className="w-7 h-7 text-brand-charcoal" />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-charcoal uppercase">{v.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <SectionHeading eyebrow="The Team" title="Athletes Behind The Zone" subtitle="A squad of sports enthusiasts, engineers and retail experts." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Alex Mercer', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
            { name: 'Priya Nair', role: 'Head of Merchandising', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' },
            { name: 'Marco Silva', role: 'Performance Consultant', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop' },
            { name: 'Jordan Kim', role: 'Customer Experience', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop' },
          ].map((m) => (
            <div key={m.name} className="text-center">
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden mb-4">
                <Image src={m.img} alt={m.name} fill className="object-cover" sizes="128px" />
              </div>
              <p className="font-bold text-brand-charcoal">{m.name}</p>
              <p className="text-xs text-gray-500">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
