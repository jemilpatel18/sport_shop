import { Zap, Truck, ShieldCheck } from 'lucide-react';

const messages = [
  { icon: Zap, text: 'FLASH SALE — UP TO 40% OFF SELECT GEAR' },
  { icon: Truck, text: 'FREE SHIPPING ON ORDERS OVER $100' },
  { icon: ShieldCheck, text: '100% SECURE CHECKOUT & EASY RETURNS' },
];

export default function AnnouncementBar() {
  const row = [...messages, ...messages];
  return (
    <div className="bg-brand-lime text-brand-charcoal overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee py-2">
        {row.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-bold uppercase tracking-wider">
            <m.icon className="w-3.5 h-3.5" />
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}
