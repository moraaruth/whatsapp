import { cn, initials, avColor } from '../../lib/utils';

const SZ = {
  xs: 'w-6 h-6 text-2xs rounded-md',
  sm: 'w-8 h-8 text-xs rounded-lg',
  md: 'w-9 h-9 text-xs rounded-lg',
  lg: 'w-11 h-11 text-sm rounded-xl',
};

export default function Av({ name, size = 'md', className }) {
  return (
    <div className={cn(
      'flex-shrink-0 flex items-center justify-center font-semibold border bg-gradient-to-br',
      SZ[size], avColor(name), className
    )}>
      {initials(name)}
    </div>
  );
}
