import { Trash2 } from 'lucide-react';

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/5 text-slate-200 border-white/10',
    green: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-200 border-rose-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

export default function AppointmentTable({ appointments, canCancel, onCancel }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-slate-200/80">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canCancel ? <th className="px-4 py-3 font-medium text-right">Action</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(appointments || []).map((a) => (
              <tr key={a._id} className="text-slate-100/90">
                <td className="px-4 py-3">{a.date}</td>
                <td className="px-4 py-3">{a.timeSlot}</td>
                <td className="px-4 py-3 font-medium">{a.patientName}</td>
                <td className="px-4 py-3">{a.phone}</td>
                <td className="px-4 py-3">{a.doctorId?.name || '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={a.status === 'cancelled' ? 'red' : 'green'}>{a.status}</Badge>
                </td>
                {canCancel ? (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onCancel(a)}
                      disabled={a.status === 'cancelled'}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Cancel appointment"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}

            {!appointments?.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-300/80" colSpan={canCancel ? 7 : 6}>
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

