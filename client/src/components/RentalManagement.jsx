import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const EMPTY_FORM = {
  customer_id: "",
  vehicle_id: "",
  pickup_location_id: "",
  pickup_date: "",
  return_date: "",
  status: "Booked",
};

export default function RentalManagement() {
  const [rentals, setRentals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // here i remember which row is editing return date and the date string in the input
  const [editState, setEditState] = useState({});

  const loadRentals = useCallback(async () => {
    const res = await axios.get("/api/rentals");
    setRentals(res.data);
  }, []);

  useEffect(() => {
    loadRentals();
    axios.get("/api/customers").then((r) => setCustomers(r.data));
    axios.get("/api/vehicles").then((r) => setVehicles(r.data));
    axios.get("/api/locations").then((r) => setLocations(r.data));
  }, [loadRentals]);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      await axios.post("/api/rentals", form);
      setForm(EMPTY_FORM);
      setFormSuccess("Rental booked successfully.");
      loadRentals();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create rental.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel rental #${id}?`)) return;
    try {
      await axios.delete(`/api/rentals/${id}`);
      loadRentals();
    } catch {
      alert("Failed to cancel rental.");
    }
  };

  const startEdit = (rental) => {
    setEditState((s) => ({
      ...s,
      [rental.rental_id]: { active: true, date: rental.return_date },
    }));
  };

  const cancelEdit = (id) => {
    setEditState((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  };

  const saveEdit = async (id) => {
    const newDate = editState[id]?.date;
    try {
      await axios.put(`/api/rentals/${id}`, { return_date: newDate });
      cancelEdit(id);
      loadRentals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update return date.");
    }
  };

  return (
    <section>
      <h2>Section 2 — Rental Management</h2>

      <details open style={{ marginBottom: "1.5rem" }}>
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}
        >
          Book New Rental
        </summary>

        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            marginTop: "0.75rem",
          }}
        >
          <div>
            <label>Customer</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleFormChange}
              required
            >
              <option value="">— select —</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Vehicle</label>
            <select
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleFormChange}
              required
            >
              <option value="">— select —</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Pickup Location</label>
            <select
              name="pickup_location_id"
              value={form.pickup_location_id}
              onChange={handleFormChange}
              required
            >
              <option value="">— select —</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="Booked">Booked</option>
              <option value="Active">Active</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div>
            <label>Pickup Date</label>
            <input
              type="date"
              name="pickup_date"
              value={form.pickup_date}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label>Return Date</label>
            <input
              type="date"
              name="return_date"
              value={form.return_date}
              onChange={handleFormChange}
              required
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn-primary">
              Book Rental
            </button>
          </div>
        </form>

        {formError && <p className="error-msg">{formError}</p>}
        {formSuccess && <p className="success-msg">{formSuccess}</p>}
      </details>

      <h3
        style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "#444" }}
      >
        All Rentals ({rentals.length})
      </h3>

      {rentals.length === 0 ? (
        <p className="empty-note">No rentals in the database.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Location</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => {
                const editing = editState[r.rental_id]?.active;
                return (
                  <tr key={r.rental_id}>
                    <td>{r.rental_id}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.vehicle_label}</td>
                    <td>{r.pickup_location_name}</td>
                    <td>{r.pickup_date}</td>
                    <td>
                      {editing ? (
                        <div className="inline-edit">
                          <input
                            type="date"
                            value={editState[r.rental_id].date}
                            onChange={(e) =>
                              setEditState((s) => ({
                                ...s,
                                [r.rental_id]: {
                                  ...s[r.rental_id],
                                  date: e.target.value,
                                },
                              }))
                            }
                            style={{ width: "130px" }}
                          />
                        </div>
                      ) : (
                        r.return_date
                      )}
                    </td>
                    <td>${r.total_cost.toFixed(2)}</td>
                    <td>{r.status}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {editing ? (
                        <>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => saveEdit(r.rental_id)}
                          >
                            Save
                          </button>{" "}
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => cancelEdit(r.rental_id)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => startEdit(r)}
                          >
                            Edit Return
                          </button>{" "}
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleDelete(r.rental_id)}
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
