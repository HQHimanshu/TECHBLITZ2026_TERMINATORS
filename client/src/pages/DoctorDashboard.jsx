import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import AppointmentTable from '../components/AppointmentTable';
import { fetchAppointments, fetchDoctorInsights } from '../services/api';
import { CalendarDays, Clock, Sparkles, Timer } from 'lucide-react';

export default function DoctorDashboard() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [appointments, setAppointments] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [apps, ins] = await Promise.all([fetchAppointments(), fetchDoctorInsights()]);
      setAppointments(apps);
      setInsights(ins);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todays = useMemo(
    () => appointments.filter((a) => a.date === today && a.status !== 'cancelled'),
    [appointments, today]
  );

  return (
    <div className="min-h-full">
      <Navbar user={user} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-300/70">Doctor</div>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">Today’s Schedule</h2>
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DashboardCard title="Appointments Today" subtitle={today} icon={CalendarDays}>
            <div className="text-3xl font-semibold text-slate-100">{todays.length}</div>
          </DashboardCard>
          <DashboardCard title="Next Slot" subtitle="Upcoming patient" icon={Clock}>
            <div className="text-sm text-slate-200">
              {todays[0] ? (
                <>
                  <span className="font-semibold">{todays[0].timeSlot}</span> · {todays[0].patientName}
                </>
              ) : (
                <span className="text-slate-300/80">No appointments yet.</span>
              )}
            </div>
          </DashboardCard>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCard title="Doctor Insights" subtitle="Operational summary" icon={Sparkles}>
            <div className="text-sm text-slate-200">
              Patients today: <span className="font-semibold">{insights?.patientsToday ?? '—'}</span>
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Free slots remaining: <span className="font-semibold">{insights?.freeSlotsRemaining ?? '—'}</span>
            </div>
          </DashboardCard>

          <DashboardCard title="Next Available Slot" subtitle={today} icon={Timer}>
            <div className="text-2xl font-semibold text-slate-100">{insights?.nextAvailableSlot || '—'}</div>
            <div className="mt-1 text-xs text-slate-300/80">Helps reception plan fast bookings</div>
          </DashboardCard>

          <DashboardCard title="Next Appointment" subtitle="If any" icon={Clock}>
            <div className="text-sm text-slate-200">
              {insights?.nextAppointment ? (
                <>
                  <span className="font-semibold">{insights.nextAppointment.timeSlot}</span> ·{' '}
                  {insights.nextAppointment.patientName}
                </>
              ) : (
                <span className="text-slate-300/80">None scheduled</span>
              )}
            </div>
          </DashboardCard>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300/80">
              Loading…
            </div>
          ) : (
            <AppointmentTable appointments={appointments} canCancel={false} onCancel={() => {}} />
          )}
        </div>
      </div>
    </div>
  );
}

