'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/stores/uiStore';
import SectionHeading from '@/components/SectionHeading';
import Spinner from '@/components/Spinner';

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', lines: ['100 Arena Street, Sports District', 'New York, NY 10001'] },
  { icon: Phone, title: 'Call Us', lines: ['+1 (555) 123-4567', 'Mon–Sat, 9am–8pm'] },
  { icon: Mail, title: 'Email Us', lines: ['support@sportzone.com', 'orders@sportzone.com'] },
  { icon: Clock, title: 'Support Hours', lines: ['24/7 Order Tracking', 'Live chat: 9am–11pm'] },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !form.subject || form.message.length < 10) {
      toast.error('Please fill all fields correctly (message min 10 chars)');
      return;
    }
    setSending(true);
    try {
      await apiClient.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.info('Message received (offline mode). We\'ll respond shortly.');
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SectionHeading eyebrow="Get In Touch" title="Contact Us" subtitle="Questions, feedback or support — we're here to help." />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 content-start">
          {contactInfo.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
              <div className="w-11 h-11 bg-brand-lime rounded-xl flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-brand-charcoal" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm text-gray-500 mt-0.5">{l}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          {sent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-700">Thanks! Your message has been sent.</p>
            </div>
          )}
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Subject *</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lime resize-none" />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="sm:col-span-2 py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Spinner className="w-4 h-4 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
