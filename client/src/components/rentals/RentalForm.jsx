import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, X } from "lucide-react";

const EMPTY = {
  customer_id: "",
  vehicle_id: "",
  pickup_location_id: "",
  pickup_date: "",
  return_date: "",
  status: "Booked",
};

const inputCls =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 " +
  "placeholder:text-gray-400";

const labelCls =
  "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

// here i load the dropdowns on mount after post the parent callback refetches the list
export default function RentalForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/customers").then((r) => setCustomers(r.data));
    axios.get("/api/vehicles").then((r) => setVehicles(r.data));
    axios.get("/api/locations").then((r) => setLocations(r.data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const close = () => {
    setOpen(false);
    setError("");
    setForm(EMPTY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/rentals", form);
      close();
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create rental.");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={
          "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 " +
          "text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none " +
          "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        }
      >
        <PlusCircle className="h-4 w-4" />
        New Rental
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Book New Rental
        </h2>
        <button
          onClick={close}
          className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Customer</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">— select customer —</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Vehicle</label>
            <select
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">— select vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Pickup Location</label>
            <select
              name="pickup_location_id"
              value={form.pickup_location_id}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">— select location —</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Pickup Date</label>
            <input
              type="date"
              name="pickup_date"
              value={form.pickup_date}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Return Date</label>
            <input
              type="date"
              name="return_date"
              value={form.return_date}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="Booked">Booked</option>
              <option value="Active">Active</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className={
              "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium " +
              "text-gray-700 hover:bg-gray-50 transition-colors"
            }
          >
            Cancel
          </button>
          <button
            type="submit"
            className={
              "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 " +
              "text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none " +
              "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            }
          >
            <PlusCircle className="h-4 w-4" />
            Book Rental
          </button>
        </div>
      </form>
    </div>
  );
}
