import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { Activity, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'receptionist') navigate('/receptionist', { replace: true });
      else navigate('/doctor', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      <div className="relative min-h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-slate-950 to-purple-600/20" />
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2">
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <ShieldCheck className="h-4 w-4 text-blue-200" />
              JWT + Role-based access
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Smart Clinic <span className="text-blue-200">Appointment</span> Management
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-200/80">
              A modern scheduling system for clinics. Prevent double bookings, reduce receptionist workload, and give doctors
              clear visibility into their day.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2 ring-1 ring-white/10">
                    <Activity className="h-5 w-5 text-blue-200" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Conflict-safe scheduling</div>
                    <div className="text-xs text-slate-300/80">Slots are checked server-side to prevent double booking.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-soft">
              <div className="text-sm font-semibold text-slate-100">Sign in</div>
              <div className="mt-1 text-xs text-slate-300/80">Use your clinic email and password.</div>

              <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="text-xs font-medium text-slate-200">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-200">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                    {error}
                  </div>
                ) : null}

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                >
                  {loading ? 'Signing in…' : 'Login'}
                </button>
              </form>

              <div className="mt-4 text-[11px] text-slate-300/70">
                Tip: create demo users on the server using `POST /api/auth/register` (see server README).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

