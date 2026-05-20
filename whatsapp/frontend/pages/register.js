import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phoneNumber:'', password:'', confirmPassword:'' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/20 to-transparent" />

      <div className="relative w-full max-w-sm animate-in-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-signal rounded-lg flex items-center justify-center">
            <Zap size={13} className="text-canvas" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-hi">LeadTracker</span>
        </div>

        <div className="bg-panel border border-edge rounded-xl p-6 shadow-op-lg">
          <div className="mb-6">
            <h2 className="text-lg font-black text-hi tracking-tight mb-1">Create account</h2>
            <p className="text-xs text-lo">
              Already have one?{' '}
              <Link href="/login" className="text-signal hover:text-signal/80 transition-colors">Sign in</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-lo mb-1.5">First Name</label>
                <input type="text" className="op-input" placeholder="John"
                  value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-lo mb-1.5">Last Name</label>
                <input type="text" className="op-input" placeholder="Kamau"
                  value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-lo mb-1.5">Email</label>
              <input type="email" className="op-input" placeholder="john@business.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-lo mb-1.5">Phone (M-Pesa)</label>
              <input type="tel" className="op-input" placeholder="254712345678"
                value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-lo mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="op-input pr-9" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lo hover:text-mid transition-colors">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-lo mb-1.5">Confirm Password</label>
              <input type="password" className="op-input" placeholder="Repeat password"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>

            {error && (
              <div className="bg-dead-dim border border-dead/20 rounded-lg px-3 py-2.5 text-xs text-dead">{error}</div>
            )}

            <button type="submit" disabled={loading} className="op-btn-primary w-full py-2.5 justify-center mt-1">
              {loading
                ? <div className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                : <>Create account <ArrowRight size={14} /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-lo mt-4">7-day free trial · M-Pesa billing · No credit card</p>
      </div>
    </div>
  );
}
