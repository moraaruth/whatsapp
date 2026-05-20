import { cn, initials, avatarColor } from '../../lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-2xs rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-12 h-12 text-base rounded-2xl',
  xl: 'w-16 h-16 text-lg rounded-2xl',
};

export default function Avatar({ name, size = 'md', className }) {
  return (
    <div className={cn(
      'flex-shrink-0 flex items-center justify-center font-semibold border bg-gradient-to-br',
      sizes[size],
      avatarColor(name),
      className
    )}>
      {initials(name)}
    </div>
  );
}
