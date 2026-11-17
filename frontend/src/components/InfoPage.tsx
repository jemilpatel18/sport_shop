import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';

export default function InfoPage({
  title,
  eyebrow,
  sections,
}: {
  title: string;
  eyebrow: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.heading} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal uppercase mb-2">{s.heading}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-10">
        Questions? <Link href="/contact" className="font-bold text-brand-charcoal hover:text-brand-lime-hover">Contact us</Link>
      </p>
    </div>
  );
}
