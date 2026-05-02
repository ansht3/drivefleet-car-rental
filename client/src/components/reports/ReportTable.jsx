import Badge from "../ui/Badge";

const TH = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider";
const TD = "px-4 py-3 text-sm text-gray-700";

export default function ReportTable({ rentals }) {
  if (!rentals || rentals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-400 font-medium">No rentals match the selected criteria.</p>
        <p className="text-gray-300 text-sm mt-1">Try widening the date range or choosing a different location.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Matching Rentals
        </span>
        <span className="text-xs text-gray-400">{rentals.length} record{rentals.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className={TH}>#</th>
              <th className={TH}>Customer</th>
              <th className={TH}>Vehicle</th>
              <th className={TH}>Location</th>
              <th className={TH}>Pickup</th>
              <th className={TH}>Return</th>
              <th className={TH}>Cost</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {rentals.map((r) => (
              <tr key={r.rental_id} className="hover:bg-gray-50 transition-colors">
                <td className={`${TD} font-mono text-gray-400`}>#{r.rental_id}</td>
                <td className={`${TD} font-medium text-gray-900`}>{r.customer_name}</td>
                <td className={TD}>{r.vehicle_label}</td>
                <td className={TD}>{r.pickup_location_name}</td>
                <td className={TD}>{r.pickup_date}</td>
                <td className={TD}>{r.return_date}</td>
                <td className={`${TD} font-semibold text-emerald-600`}>${r.total_cost.toFixed(2)}</td>
                <td className={TD}><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
