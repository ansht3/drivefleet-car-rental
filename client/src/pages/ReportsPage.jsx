import { useState, useRef } from "react";
import { Calendar, TrendingUp, DollarSign, Download } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import ReportFilters from "../components/reports/ReportFilters";
import ReportTable from "../components/reports/ReportTable";
import StatCard from "../components/ui/StatCard";

export default function ReportsPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const filtersRef = useRef(null);

  const handleExportCSV = () => {
    if (!filtersRef.current) return;
    const { location_id, start_date, end_date } = filtersRef.current;
    const params = new URLSearchParams({ location_id, start_date, end_date });
    window.open(`/api/reports/rentals/csv?${params.toString()}`, "_blank");
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analyze vehicle utilization and revenue with any location and date range"
      />

      <div className="space-y-6">
        <ReportFilters
          onResults={setResult}
          onError={setError}
          filtersRef={filtersRef}
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleExportCSV}
                className={
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white " +
                  "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                  "focus:ring-offset-2 transition-colors"
                }
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Calendar}
                label="Total Rental Days"
                value={result.total_rental_days}
                sub={`across ${result.rentals.length} rental${result.rentals.length !== 1 ? "s" : ""}`}
                color="indigo"
              />
              <StatCard
                icon={DollarSign}
                label="Average Revenue"
                value={`$${result.average_revenue.toFixed(2)}`}
                color="emerald"
              />
              <StatCard
                icon={TrendingUp}
                label="Fleet Occupancy Rate"
                value={`${result.utilization_rate_percentage}%`}
                sub="percent of available vehicle-days booked during selected date range"
                color="amber"
              />
            </div>

            <ReportTable rentals={result.rentals} />
          </>
        )}

        {!result && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
            <div className="text-6xl mb-4 select-none">📶</div>
            <p className="font-medium text-gray-500">
              Select a location and date range, then click Generate Report
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Results include matching rentals and three fleet statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
