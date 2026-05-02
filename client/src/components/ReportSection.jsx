import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ReportSection() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ location_id: "", start_date: "", end_date: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/locations").then((res) => {
      setLocations(res.data);
      if (res.data.length > 0)
        setForm((f) => ({ ...f, location_id: res.data[0].location_id }));
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!form.location_id || !form.start_date || !form.end_date) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("/api/reports/rentals", { params: form });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Section 1 — Report Generator</h2>

      <form onSubmit={handleSubmit} style={{ flexDirection: "row", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: "180px" }}>
          <label htmlFor="location_id">Location</label>
          <select id="location_id" name="location_id" value={form.location_id} onChange={handleChange}>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" id="start_date" name="start_date" value={form.start_date} onChange={handleChange} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label htmlFor="end_date">End Date</label>
          <input type="date" id="end_date" name="end_date" value={form.end_date} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Loading…" : "Generate Report"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {result && (
        <>
          <div className="stats-bar" style={{ marginTop: "1.2rem" }}>
            <div className="stat-box">
              <div className="stat-value">{result.total_rental_days}</div>
              <div className="stat-label">Total Rental Days</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">${result.average_revenue.toFixed(2)}</div>
              <div className="stat-label">Average Revenue / Rental</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{result.utilization_rate_percentage}%</div>
              <div className="stat-label">Fleet Utilization Rate</div>
            </div>
          </div>

          {result.rentals.length === 0 ? (
            <p className="empty-note">No rentals found for the selected criteria.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Pickup Location</th>
                    <th>Pickup Date</th>
                    <th>Return Date</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rentals.map((r) => (
                    <tr key={r.rental_id}>
                      <td>{r.rental_id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.vehicle_label}</td>
                      <td>{r.pickup_location_name}</td>
                      <td>{r.pickup_date}</td>
                      <td>{r.return_date}</td>
                      <td>${r.total_cost.toFixed(2)}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
