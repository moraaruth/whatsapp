import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { cn, initials, avColor } from '../../lib/utils';
import {
  Inbox, Users, GitBranch, Clock,
  CreditCard, Settings, LogOut, Zap,
  Bell, Search
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: Inbox,      label: 'Inbox',     badge: null },
  { href: '/leads',     icon: Users,      label: 'Leads',     badge: null },
  { href: '/pipeline',  icon: GitBranch,  label: 'Pipeline',  badge: null },
  { href: '/followups', icon: Clock,      label: 'Follow-ups',badge: '3'  },
  { href: '/subscription', icon: CreditCard, label: 'Billing', badge: null },
];

export default function Shell({ children, topbar }) {
  const router = useRouter();
  const [user, setUser] = useState({});

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
  }, []);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Rail — ultra-narrow icon nav */}
      <div className="w-14 bg-panel border-r border-edge flex flex-col items-center py-4 gap-1 flex-shrink-0 z-50">
        {/* Logo */}
        <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
          <Zap size={14} className="text-canvas" strokeWidth={2.5} />
        </div>

        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} title={label}>
              <div className={cn(
                'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer group',
                active
                  ? 'bg-signal-dim text-signal'
                  : 'text-lo hover:text-mid hover:bg-panel-3'
              )}>
                <Icon size={16} />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-urgent text-canvas text-2xs font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-panel-4 border border-edge-2 rounded-md text-xs text-hi whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              </div>
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Settings */}
        <Link href="/settings" title="Settings">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lo hover:text-mid hover:bg-panel-3 transition-all cursor-pointer">
            <Settings size={15} />
          </div>
        </Link>

        {/* Avatar */}
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          title="Sign out"
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-2xs font-bold border bg-gradient-to-br mt-1',
            avColor(`${user.firstName} ${user.lastName}`)
          )}
        >
          {initials(`${user.firstName || 'U'} ${user.lastName || ''}`)}
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        {topbar && (
          <div className="h-11 bg-panel border-b border-edge flex items-center px-4 gap-3 flex-shrink-0">
            {topbar}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
