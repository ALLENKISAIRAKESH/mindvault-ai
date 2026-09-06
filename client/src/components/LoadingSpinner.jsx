export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} border-2 border-transparent rounded-full animate-spin`}
        style={{ borderTopColor: 'var(--color-accent-1)', borderRightColor: 'var(--color-accent-3)' }}
      />
      {text && <p className="text-sm" style={{ color: 'var(--color-soft)' }}>{text}</p>}
    </div>
  );
}
