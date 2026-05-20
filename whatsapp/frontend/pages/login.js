import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Left — live activity blur */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 bg-panel" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top line accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent" />

        {/* Blurred activity in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm pointer-events-none select-none">
          <div className="space-y-2 w-80">
            {['James K. — Is the apartment available?', 'Mary W. — Price for the Toyota?', 'Peter O. — Clinic appointment?', 'Sarah M. — Training schedule?'].map((t, i) => (
              <div key={i} className="bg-panel-3 border border-edge rounded-lg px-3 py-2 text-xs text-mid">{t}</div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-20">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-canvas" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-hi">LeadTracker</span>
          </div>

          <h1 className="text-4xl font-black text-hi leading-tight tracking-tight mb-4">
            Your WhatsApp<br />sales command<br />
            <span className="text-signal">center.</span>
          </h1>
          <p className="text-mid text-sm leading-relaxed max-w-xs">
            Every lead. Every conversation. Every follow-up. One place.
          </p>
        </div>

        {/* Bottom status bar */}
        <div className="relative z-10 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-dot" />
            <span className="text-mid">System operational</span>
          </div>
          <div className="w-px h-3 bg-edge-2" />
          <span className="text-lo">End-to-end encrypted</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-canvas">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-edge to-transparent hidden lg:block" />

        <div className="w-full max-w-xs animate-in-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-signal rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-canvas" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-hi">LeadTracker</span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-black text-hi tracking-tight mb-1">Sign in</h2>
            <p className="text-xs text-lo">
              No account?{' '}
              <Link href="/register" className="text-signal hover:text-signal/80 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-lo mb-1.5">Email or Phone</label>
              <input type="text" className="op-input" placeholder="you@business.com"
                value={form.emailOrPhone} onChange={e => setForm({ ...form, emailOrPhone: e.target.value })} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-lo">Password</label>
                <button type="button" className="text-xs text-signal/70 hover:text-signal transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="op-input pr-9" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lo hover:text-mid transition-colors">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-dead-dim border border-dead/20 rounded-lg px-3 py-2.5 text-xs text-dead">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="op-btn-primary w-full py-2.5 mt-1 justify-center">
              {loading
                ? <div className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                : <>Sign in <ArrowRight size={14} /></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
