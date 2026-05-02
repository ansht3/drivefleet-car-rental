const STYLES = {
  Booked:   "bg-indigo-100 text-indigo-700",
  Active:   "bg-emerald-100 text-emerald-700",
  Returned: "bg-gray-100 text-gray-600",
};

export default function Badge({ status }) {
  const cls = STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
