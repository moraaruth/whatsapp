import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, Users, CreditCard,
  Settings, LogOut, Zap, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/activity', icon: Activity, label: 'Activity' },
  { href: '/subscription', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-surface border-r border-line flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green rounded-xl flex items-center justify-center shadow-glow-green-sm flex-shrink-0">
            <Zap size={15} className="text-void" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-1 leading-none">LeadTracker</p>
            <p className="text-2xs text-ink-4 mt-0.5">WhatsApp CRM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-2xs font-semibold text-ink-4 uppercase tracking-widest px-3 mb-3">Workspace</p>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}>
              <div className={active ? 'nav-item-active' : 'nav-item'}>
                <Icon size={16} className="flex-shrink-0" />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-line">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="nav-item w-full hover:text-rose hover:bg-rose/5"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
