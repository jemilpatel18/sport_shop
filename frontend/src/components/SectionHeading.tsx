export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  dark?: boolean;
}) {
  return (
    <div className={`${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-2xl mb-10`}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-lime bg-brand-charcoal px-3 py-1 rounded-full mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-4xl font-bold uppercase tracking-tight ${dark ? 'text-white' : 'text-brand-charcoal'}`}>
        {title}
      </h2>
      {subtitle && <p className={`mt-3 text-sm md:text-base ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
    </div>
  );
}
