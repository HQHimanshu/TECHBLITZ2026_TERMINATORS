import { LogOut, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
  const navigate = useNavigate();

  function onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 p-2 ring-1 ring-white/10">
            <Stethoscope className="h-5 w-5 text-blue-100" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100">Smart Clinic</div>
            <div className="text-xs text-slate-300/80">Appointment Management</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-slate-200">{user.name}</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-300/70">{user.role}</div>
            </div>
          ) : null}

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

