import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentTable from '../components/AppointmentTable';
import { CalendarPlus, ClipboardList, Users, Sparkles } from 'lucide-react';
import { cancelAppointment, createAppointment, fetchAppointments, fetchDoctors, fetchReceptionistInsights } from '../services/api';

export default function ReceptionistDashboard() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [availabilityKey, setAvailabilityKey] = useState(0);
  const [insights, setInsights] = useState(null);
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [docs, apps, ins] = await Promise.all([fetchDoctors(), fetchAppointments(), fetchReceptionistInsights()]);
      setDoctors(docs);
      setAppointments(apps);
      setInsights(ins);
      setAvailabilityKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(payload) {
    setError('');
    setSubmitting(true);
    try {
      await createAppointment(payload);
      setToast('Appointment booked successfully.');
      await load();
      setAvailabilityKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 2500);
    }
  }

  async function onCancel(a) {
    setError('');
    try {
      await cancelAppointment(a._id);
      setToast('Appointment cancelled.');
      await load();
      setAvailabilityKey((k) => k + 1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setTimeout(() => setToast(''), 2500);
    }
  }

  const todaysCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => a.date === today && a.status !== 'cancelled').length;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const doctorName = a.doctorId?.name || '';
      const matchesSearch =
        !q ||
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.phone || '').toLowerCase().includes(q) ||
        doctorName.toLowerCase().includes(q) ||
        (a.date || '').toLowerCase().includes(q) ||
        (a.timeSlot || '').toLowerCase().includes(q) ||
        (a.status || '').toLowerCase().includes(q);

      const matchesDoctor = !filterDoctorId || a.doctorId?._id === filterDoctorId;
      const matchesDate = !filterDate || a.date === filterDate;
      const matchesStatus = !filterStatus || a.status === filterStatus;

      return (
        matchesSearch &&
        matchesDoctor &&
        matchesDate &&
        matchesStatus
      );
    });
  }, [appointments, search, filterDoctorId, filterDate, filterStatus]);

  return (
    <div className="min-h-full">
      <Navbar user={user} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-300/70">Receptionist</div>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">Clinic Dashboard</h2>
          </div>
          {toast ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {toast}
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCard title="Book Appointment" subtitle="Create conflict-free bookings" icon={CalendarPlus}>
            <div className="text-xs text-slate-300/80">
              Slots are validated server-side by doctor + date + time.
            </div>
          </DashboardCard>
          <DashboardCard title="Today's Appointments" subtitle="Live count for today" icon={ClipboardList}>
            <div className="text-3xl font-semibold text-slate-100">{todaysCount}</div>
          </DashboardCard>
          <DashboardCard title="Doctors" subtitle="Available for booking" icon={Users}>
            <div className="text-3xl font-semibold text-slate-100">{doctors.length}</div>
          </DashboardCard>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <DashboardCard title="Clinic Insights" subtitle="Today + this week" icon={Sparkles} className="md:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] text-slate-300/80">Appointments today</div>
                <div className="mt-1 text-xl font-semibold text-slate-100">{insights?.today?.total ?? '—'}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] text-slate-300/80">Cancelled today</div>
                <div className="mt-1 text-xl font-semibold text-slate-100">{insights?.today?.cancelled ?? '—'}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] text-slate-300/80">Most busy slot</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">
                  {insights?.busiest?.timeSlot ? `${insights.busiest.timeSlot} (${insights.busiest.count})` : '—'}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] text-slate-300/80">Week cancellation rate</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">
                  {insights ? `${insights.cancellationRateWeek}%` : '—'}
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="This Week" subtitle={insights?.week?.start ? `From ${insights.week.start}` : ''} icon={ClipboardList}>
            <div className="text-3xl font-semibold text-slate-100">{insights?.week?.total ?? '—'}</div>
            <div className="mt-1 text-xs text-slate-300/80">Total appointments</div>
          </DashboardCard>

          <DashboardCard title="This Week" subtitle="Cancelled" icon={ClipboardList}>
            <div className="text-3xl font-semibold text-slate-100">{insights?.week?.cancelled ?? '—'}</div>
            <div className="mt-1 text-xs text-slate-300/80">Cancellations</div>
          </DashboardCard>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-soft">
              <div className="text-sm font-semibold text-slate-100">New Appointment</div>
              <div className="mt-1 text-xs text-slate-300/80">Fill patient details and select a slot.</div>
              <div className="mt-4">
                <AppointmentForm doctors={doctors} onSubmit={onCreate} submitting={submitting} refreshKey={availabilityKey} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-100">Appointments</div>
                <div className="text-xs text-slate-300/80">All scheduled and cancelled appointments.</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient / phone / doctor…"
                  className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
                />
                <select
                  value={filterDoctorId}
                  onChange={(e) => setFilterDoctorId(e.target.value)}
                  className="w-44 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
                >
                  <option value="" className="bg-slate-900">
                    All doctors
                  </option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-900">
                      {d.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-36 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
                >
                  <option value="" className="bg-slate-900">
                    All status
                  </option>
                  <option value="scheduled" className="bg-slate-900">
                    Scheduled
                  </option>
                  <option value="cancelled" className="bg-slate-900">
                    Cancelled
                  </option>
                </select>
                <button
                  onClick={load}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300/80">
                Loading…
              </div>
            ) : (
              <AppointmentTable appointments={filteredAppointments} canCancel={true} onCancel={onCancel} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

