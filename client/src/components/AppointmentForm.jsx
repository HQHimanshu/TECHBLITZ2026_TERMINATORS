import { useEffect, useMemo, useState } from 'react';
import { fetchAvailability } from '../services/api';

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export default function AppointmentForm({ doctors, onSubmit, submitting, refreshKey = 0 }) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    doctorId: '',
    date: todayIso,
    timeSlot: TIME_SLOTS[0],
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!form.doctorId && doctors?.length) {
      setForm((f) => ({ ...f, doctorId: doctors[0]._id }));
    }
  }, [doctors, form.doctorId]);

  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      if (!form.doctorId || !form.date) return;
      setLoadingSlots(true);
      try {
        const data = await fetchAvailability(form.doctorId, form.date);
        if (!cancelled) setBookedSlots(data.bookedSlots || []);
      } catch {
        if (!cancelled) setBookedSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [form.doctorId, form.date, refreshKey]);

  useEffect(() => {
    // If currently selected slot becomes booked, auto-pick first available.
    if (!bookedSlots?.length) return;
    if (bookedSlots.includes(form.timeSlot)) {
      const firstAvailable = TIME_SLOTS.find((t) => !bookedSlots.includes(t));
      if (firstAvailable) setForm((f) => ({ ...f, timeSlot: firstAvailable }));
    }
  }, [bookedSlots, form.timeSlot]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(form);
    setForm((f) => ({ ...f, patientName: '', phone: '' }));
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-200">Patient Name</label>
        <input
          value={form.patientName}
          onChange={(e) => setField('patientName', e.target.value)}
          required
          placeholder="e.g. Aditi Sharma"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-200">Patient Phone </label>
        <input
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          required
          placeholder="e.g. 9876543210"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-200">
          Patient Email 
        </label>
        <input
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          type="email"
          placeholder="e.g. patient@gmail.com"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-blue-500/40 focus:ring-2"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-200">Doctor</label>
        <select
          value={form.doctorId}
          onChange={(e) => setField('doctorId', e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
        >
          {(doctors || []).map((d) => (
            <option key={d._id} value={d._id} className="bg-slate-900">
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-200">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          min={todayIso}
          required
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-200">Time Slot</label>
        <select
          value={form.timeSlot}
          onChange={(e) => setField('timeSlot', e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-blue-500/40 focus:ring-2"
        >
          {TIME_SLOTS.map((t) => {
            const isBooked = bookedSlots.includes(t);
            return (
              <option key={t} value={t} disabled={isBooked} className="bg-slate-900">
                {t} {isBooked ? '— booked' : '— available'}
              </option>
            );
          })}
        </select>
        <div className="mt-1 text-[11px] text-slate-300/70">
          {loadingSlots ? 'Checking slot availability…' : `Booked slots: ${bookedSlots.length}`}
        </div>
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
        <button
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {submitting ? 'Booking…' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
}

