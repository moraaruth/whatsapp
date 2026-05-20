import { useState, useEffect } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { initials, avatarColor } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function TopBar({ onMenu, menuOpen }) {
  const [focused, setFocused] = useState(false);
  const [user, setUser] = useState({});
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
  }, []);

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-xl border-b border-line flex items-center px-4 gap-3 sticky top-0 z-30">
      <button onClick={onMenu} className="btn-ghost p-2 lg:hidden">
        {menuOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {/* Search */}
      <div className={cn('relative transition-all duration-300', focused ? 'flex-1 max-w-lg' : 'w-64')}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
        <input
          type="text"
          placeholder="Search leads..."
          className="input pl-9 py-2 text-xs"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!focused && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-ink-4 bg-surface-3 border border-line px-1.5 py-0.5 rounded-md hidden sm:block">
            /
          </kbd>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="btn-ghost p-2 relative">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-line">
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center text-2xs font-bold border bg-gradient-to-br flex-shrink-0',
            avatarColor(`${user.firstName} ${user.lastName}`)
          )}>
            {initials(`${user.firstName || 'U'} ${user.lastName || ''}`)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-ink-1 leading-none">{user.firstName || 'User'}</p>
            <p className="text-2xs text-ink-4 mt-0.5 capitalize">{user.role || 'user'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
