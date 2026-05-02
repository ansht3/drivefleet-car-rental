import { useState, useEffect, useImperativeHandle } from "react";
import axios from "axios";
import { Search, MapPin, Calendar } from "lucide-react";

const inputCls =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 " +
  "placeholder:text-gray-400";

const labelCls =
  "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

export default function ReportFilters({ onResults, onError, filtersRef }) {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    location_id: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);

  // here i keep filtersRef wired to form so csv export uses the same params
  useEffect(() => {
    if (filtersRef) filtersRef.current = form;
  }, [form, filtersRef]);

  useEffect(() => {
    axios.get("/api/locations").then((res) => {
      setLocations(res.data);
      if (res.data.length > 0)
        setForm((f) => ({ ...f, location_id: res.data[0].location_id }));
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location_id || !form.start_date || !form.end_date) {
      onError("All three fields are required.");
      return;
    }
    setLoading(true);
    onError("");
    try {
      // here i use GET + query string because the report route expects that not a body
      const res = await axios.get("/api/reports/rentals", { params: form });
      onResults(res.data);
    } catch (err) {
      onError(err.response?.data?.error || "Failed to load report.");
      onResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Location
            </span>
          </label>
          <select
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">— select location —</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Start Date
            </span>
          </label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              End Date
            </span>
          </label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white " +
            "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
            "focus:ring-offset-2 disabled:opacity-60 transition-colors"
          }
        >
          <Search className="h-4 w-4" />
          {loading ? "Generating…" : "Generate Report"}
        </button>
      </div>
    </form>
  );
}
