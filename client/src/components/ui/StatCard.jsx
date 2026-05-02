const COLOR_MAP = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "indigo",
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${COLOR_MAP[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 mt-1.5 leading-snug">{sub}</p>
        )}
      </div>
    </div>
  );
}
