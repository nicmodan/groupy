import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });

  function set(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await login(form.email, form.password);
      } else {
        await signup(form.email, form.password, form.firstName, form.lastName);
      }
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG glows */}
      <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-accent2/12 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm bg-paper/5 border border-paper/12 rounded-2xl p-10 animate-fade-in">
        <Link to="/" className="block font-syne text-xl font-extrabold text-paper mb-8">
          Group<span className="text-accent">ify</span>
        </Link>

        {/* Tabs */}
        <div className="flex border-b border-paper/15 mb-7">
          {['signin', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`px-5 pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-accent text-paper'
                  : 'border-transparent text-paper/40 hover:text-paper/70'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="font-syne text-2xl font-extrabold text-paper mb-1">
            {tab === 'signin' ? 'Welcome back' : 'Get started free'}
          </h2>
          <p className="text-sm text-paper/40 mb-7">
            {tab === 'signin' ? 'Sign in to your admin dashboard' : 'Create your educator account'}
          </p>

          {tab === 'signup' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-paper/70 mb-1.5">First Name</label>
                <input className="input-field bg-paper/7 border-paper/15 text-paper placeholder-paper/25 focus:border-accent focus:ring-accent/20" placeholder="Jane" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-paper/70 mb-1.5">Last Name</label>
                <input className="input-field bg-paper/7 border-paper/15 text-paper placeholder-paper/25 focus:border-accent focus:ring-accent/20" placeholder="Smith" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-paper/70 mb-1.5">Email Address</label>
            <input
              type="email"
              className="input-field bg-paper/7 border-paper/15 text-paper placeholder-paper/25 focus:border-accent focus:ring-accent/20"
              placeholder="you@school.edu"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-paper/70 mb-1.5">Password</label>
            <input
              type="password"
              className="input-field bg-paper/7 border-paper/15 text-paper placeholder-paper/25 focus:border-accent focus:ring-accent/20"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-3 text-base font-semibold disabled:opacity-60"
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center mt-5 text-xs text-paper/30">
          <Link to="/" className="hover:text-paper/60 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
