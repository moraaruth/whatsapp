import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, []);

  return (
    <div className="min-h-screen bg-base flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[220px] flex-shrink-0" />
      <Sidebar />

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 lg:hidden transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar onMenu={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
