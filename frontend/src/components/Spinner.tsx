export default function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-brand-lime ${className}`} />
  );
}
