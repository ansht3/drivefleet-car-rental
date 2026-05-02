import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Car,
  DollarSign,
  MapPin,
  ClipboardList,
  PlusCircle,
  BarChart2,
} from "lucide-react";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [locationCount, setLocationCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/rentals"),
      axios.get("/api/locations"),
      axios.get("/api/vehicles"),
    ]).then(([r, l, v]) => {
      setRentals(r.data);
      setLocationCount(l.data.length);
      setVehicleCount(v.data.length);
      setLoading(false);
    });
  }, []);

  const totalRevenue = rentals.reduce((s, r) => s + r.total_cost, 0);
  const recent = rentals.slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of fleet activity and revenue"
      />

      {loading ? (
        <p className="text-gray-400 text-sm animate-pulse">Loading data…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ClipboardList}
              label="Total Rentals"
              value={rentals.length}
              color="indigo"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="emerald"
            />
            <StatCard
              icon={Car}
              label="Fleet Size"
              value={vehicleCount}
              sub="registered vehicles"
              color="amber"
            />
            <StatCard
              icon={MapPin}
              label="Locations"
              value={locationCount}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate("/rentals")}
              className={
                "flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 " +
                "text-left hover:border-indigo-300 hover:shadow-md transition-all group"
              }
            >
              <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <PlusCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Rentals</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add, edit, or cancel bookings
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className={
                "flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 " +
                "text-left hover:border-indigo-300 hover:shadow-md transition-all group"
              }
            >
              <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <BarChart2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Filter by location and date range
                </p>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Recent Rentals
              </h2>
              <button
                onClick={() => navigate("/rentals")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </button>
            </div>

            {recent.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No rentals yet. Go to Rentals to book one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "#",
                        "Customer",
                        "Vehicle",
                        "Pickup",
                        "Return",
                        "Cost",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recent.map((r) => (
                      <tr
                        key={r.rental_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-400">
                          #{r.rental_id}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {r.customer_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {r.vehicle_label}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {r.pickup_date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {r.return_date}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                          ${r.total_cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
