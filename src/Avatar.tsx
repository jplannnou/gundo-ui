type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: Size;
  className?: string;
}

const sizeStyles: Record<Size, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, alt, initials, size = 'md', className = '' }: AvatarProps) {
  const base = `${sizeStyles[size]} rounded-full flex items-center justify-center shrink-0 font-medium ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={`${sizeStyles[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  const letters = initials || getInitials(alt);

  return (
    <div
      className={`${base} bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]`}
      aria-label={alt}
    >
      {letters}
    </div>
  );
}
