import { cn } from '../../lib/utils';

export default function KpiCard({ label, value, sub, icon: Icon, glow, loading }) {
  return (
    <div className={cn(
      'card p-5 relative overflow-hidden group hover:border-line-2 transition-all duration-300',
      glow && 'border-green-border hover:border-green/30'
    )}>
      {glow && (
        <div className="absolute inset-0 bg-radial-green opacity-60 pointer-events-none" />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-ink-3 tracking-wide">{label}</span>
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center',
            glow ? 'bg-green-dim text-green' : 'bg-surface-3 text-ink-3 group-hover:text-ink-2'
          )}>
            <Icon size={14} />
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-7 w-20 rounded-lg" />
            <div className="skeleton h-3 w-14 rounded" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-ink-1 tracking-tight tabular-nums">{value}</p>
            {sub && <p className="text-xs text-ink-3 mt-1">{sub}</p>}
          </>
        )}
      </div>
    </div>
  );
}
