export default function DashboardCard({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-soft',
        'p-5 transition hover:bg-white/7.5 hover:border-white/15',
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2 ring-1 ring-white/10">
            <Icon className="h-5 w-5 text-blue-200" />
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-300/90">{subtitle}</div> : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

