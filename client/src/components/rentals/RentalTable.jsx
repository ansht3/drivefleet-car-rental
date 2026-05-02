import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import Badge from "../ui/Badge";

const TH =
  "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider";
const TD = "px-4 py-3 text-sm";

const COLUMNS = [
  {
    key: "rental_id",
    label: "#",
    sortLabel: "ID",
    type: "number",
    filterable: false,
  },
  {
    key: "customer_name",
    label: "Customer",
    sortLabel: "Name",
    type: "string",
    filterable: true,
  },
  {
    key: "vehicle_label",
    label: "Vehicle",
    sortLabel: "Name",
    type: "string",
    filterable: true,
  },
  {
    key: "pickup_location_name",
    label: "Location",
    sortLabel: "Name",
    type: "string",
    filterable: true,
  },
  {
    key: "pickup_date",
    label: "Pickup",
    sortLabel: "Date",
    type: "date",
    filterable: false,
  },
  {
    key: "return_date",
    label: "Return",
    sortLabel: "Date",
    type: "date",
    filterable: false,
  },
  {
    key: "total_cost",
    label: "Cost",
    sortLabel: "Cost",
    type: "number",
    filterable: false,
  },
  {
    key: "status",
    label: "Status",
    sortLabel: "Status",
    type: "string",
    filterable: true,
  },
];

function sortHint(type, direction) {
  if (type === "string") return direction === "asc" ? "A → Z" : "Z → A";
  if (type === "number")
    return direction === "asc" ? "Lowest → Highest" : "Highest → Lowest";
  if (type === "date")
    return direction === "asc" ? "Oldest → Newest" : "Newest → Oldest";
  return "";
}

function compare(a, b, key, type) {
  const va = a[key];
  const vb = b[key];
  if (va == null && vb == null) return 0;
  if (va == null) return -1;
  if (vb == null) return 1;

  if (type === "number") return va - vb;
  if (type === "date") return va < vb ? -1 : va > vb ? 1 : 0;
  return String(va).localeCompare(String(vb));
}

function SortDropdown({ columnKey, type, activeDirection, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const ascLabel = sortHint(type, "asc");
  const descLabel = sortHint(type, "desc");

  const optCls = (active) =>
    "w-full text-left px-3 py-1.5 text-xs transition-colors " +
    (active
      ? "bg-indigo-50 text-indigo-700 font-semibold"
      : "text-gray-700 hover:bg-gray-50");

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      <button
        onClick={() => onSelect(columnKey, "asc")}
        className={optCls(activeDirection === "asc")}
      >
        {ascLabel}
      </button>
      <button
        onClick={() => onSelect(columnKey, "desc")}
        className={optCls(activeDirection === "desc")}
      >
        {descLabel}
      </button>
      <div className="border-t border-gray-100 my-0.5" />
      <button
        onClick={() => onSelect(columnKey, null)}
        className={
          "w-full text-left px-3 py-1.5 text-xs transition-colors " +
          (!activeDirection
            ? "bg-indigo-50 text-indigo-700 font-semibold"
            : "text-gray-500 hover:bg-gray-50 italic")
        }
      >
        None
      </button>
    </div>
  );
}

function ColumnFilterDropdown({
  columnKey,
  options,
  activeValue,
  onSelect,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] max-h-52 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      <button
        onClick={() => onSelect(columnKey, null)}
        className={
          "w-full text-left px-3 py-1.5 text-xs transition-colors " +
          (!activeValue
            ? "bg-indigo-50 text-indigo-700 font-semibold"
            : "text-gray-500 hover:bg-gray-50 italic")
        }
      >
        None
      </button>
      <div className="border-t border-gray-100 my-0.5" />
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(columnKey, opt)}
          className={
            "w-full text-left px-3 py-1.5 text-xs transition-colors truncate " +
            (activeValue === opt
              ? "bg-indigo-50 text-indigo-700 font-semibold"
              : "text-gray-700 hover:bg-gray-50")
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function RentalTable({ rentals, onRefresh }) {
  const [editState, setEditState] = useState({});
  // here i stack sort keys: first one is the main sort, later ones only break ties
  const [sortConfigs, setSortConfigs] = useState([]);
  const [openSortDropdown, setOpenSortDropdown] = useState(null);
  const [filters, setFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);

  const handleSortSelect = useCallback((columnKey, direction) => {
    setSortConfigs((prev) => {
      const without = prev.filter((s) => s.key !== columnKey);
      if (direction === null) return without;
      return [...without, { key: columnKey, direction }];
    });
    setOpenSortDropdown(null);
  }, []);

  const closeSortDropdown = useCallback(() => setOpenSortDropdown(null), []);

  const handleFilterSelect = useCallback((columnKey, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[columnKey];
      } else {
        next[columnKey] = value;
      }
      return next;
    });
    setOpenFilter(null);
  }, []);

  const closeFilter = useCallback(() => setOpenFilter(null), []);

  const filterOptions = useMemo(() => {
    const opts = {};
    for (const col of COLUMNS) {
      if (!col.filterable) continue;
      const set = new Set();
      for (const r of rentals) {
        const v = r[col.key];
        if (v != null) set.add(String(v));
      }
      opts[col.key] = [...set].sort();
    }
    return opts;
  }, [rentals]);

  const processedRentals = useMemo(() => {
    let data = rentals;

    const activeFilters = Object.entries(filters);
    if (activeFilters.length > 0) {
      data = data.filter((r) =>
        activeFilters.every(([key, value]) => String(r[key]) === value),
      );
    }

    if (sortConfigs.length === 0) return data;
    const sorted = [...data].sort((a, b) => {
      for (const { key, direction } of sortConfigs) {
        const col = COLUMNS.find((c) => c.key === key);
        if (!col) continue;
        const result = compare(a, b, key, col.type);
        if (result !== 0) return direction === "desc" ? -result : result;
      }
      return 0;
    });
    return sorted;
  }, [rentals, filters, sortConfigs]);

  const activeFilterCount = Object.keys(filters).length;

  const startEdit = (r) =>
    setEditState((s) => ({
      ...s,
      [r.rental_id]: { active: true, date: r.return_date },
    }));

  const cancelEdit = (id) =>
    setEditState((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });

  const saveEdit = async (id) => {
    try {
      await axios.put(`/api/rentals/${id}`, {
        return_date: editState[id].date,
      });
      cancelEdit(id);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update return date.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel rental #${id}? This action cannot be undone.`))
      return;
    try {
      await axios.delete(`/api/rentals/${id}`);
      onRefresh?.();
    } catch {
      alert("Failed to cancel rental.");
    }
  };

  if (rentals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="text-5xl mb-4 select-none">🚗</div>
        <p className="font-medium text-gray-500">No rentals yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Click <strong>New Rental</strong> above to book the first one.
        </p>
      </div>
    );
  }

  const dateInputCls =
    "rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 " +
    "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Filters:
          </span>
          {Object.entries(filters).map(([key, value]) => {
            const col = COLUMNS.find((c) => c.key === key);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-white border border-indigo-200 rounded-full px-2.5 py-0.5 text-xs font-medium text-indigo-700"
              >
                {col?.label}: {value}
                <button
                  onClick={() => handleFilterSelect(key, null)}
                  className="ml-0.5 hover:text-indigo-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => setFilters({})}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map((col) => {
                const sortEntry = sortConfigs.find((s) => s.key === col.key);
                const sortActive = !!sortEntry;
                const dir = sortEntry?.direction;
                const hint = sortActive ? sortHint(col.type, dir) : "";
                const sortIsOpen = openSortDropdown === col.key;
                const filterActive = !!filters[col.key];
                const filterIsOpen = openFilter === col.key;

                return (
                  <th
                    key={col.key}
                    className={`${TH} select-none group relative`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>

                      <div className="relative ml-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSortDropdown((prev) =>
                              prev === col.key ? null : col.key,
                            );
                            setOpenFilter(null);
                          }}
                          className={
                            "p-0.5 rounded transition-colors cursor-pointer " +
                            (sortActive
                              ? "text-indigo-600"
                              : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-400 transition-opacity")
                          }
                          title={
                            sortActive
                              ? `Sorted: ${hint}`
                              : `Sort by ${col.sortLabel}`
                          }
                        >
                          {sortActive && dir === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronUp className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {sortIsOpen && (
                          <SortDropdown
                            columnKey={col.key}
                            type={col.type}
                            activeDirection={dir || null}
                            onSelect={handleSortSelect}
                            onClose={closeSortDropdown}
                          />
                        )}
                      </div>

                      {col.filterable && (
                        <div className="relative ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilter((prev) =>
                                prev === col.key ? null : col.key,
                              );
                              setOpenSortDropdown(null);
                            }}
                            className={
                              "p-0.5 rounded transition-colors " +
                              (filterActive
                                ? "text-indigo-600"
                                : "text-gray-300 hover:text-indigo-400")
                            }
                            title={
                              filterActive
                                ? `Filtered: ${filters[col.key]}`
                                : `Filter by ${col.label}`
                            }
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                          {filterIsOpen && (
                            <ColumnFilterDropdown
                              columnKey={col.key}
                              options={filterOptions[col.key] || []}
                              activeValue={filters[col.key] || null}
                              onSelect={handleFilterSelect}
                              onClose={closeFilter}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className={TH}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {processedRentals.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-sm text-gray-400">
                    No rentals match the active filters.
                  </p>
                  <button
                    onClick={() => setFilters({})}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            ) : (
              processedRentals.map((r) => {
                const editing = !!editState[r.rental_id]?.active;
                return (
                  <tr
                    key={r.rental_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className={`${TD} font-mono text-gray-400`}>
                      #{r.rental_id}
                    </td>
                    <td className={`${TD} font-medium text-gray-900`}>
                      {r.customer_name}
                    </td>
                    <td className={`${TD} text-gray-700`}>{r.vehicle_label}</td>
                    <td className={`${TD} text-gray-700`}>
                      {r.pickup_location_name}
                    </td>
                    <td className={`${TD} text-gray-700`}>{r.pickup_date}</td>

                    <td className={`${TD} text-gray-700`}>
                      {editing ? (
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
                          className={dateInputCls}
                        />
                      ) : (
                        r.return_date
                      )}
                    </td>

                    <td className={`${TD} font-semibold text-emerald-600`}>
                      ${r.total_cost.toFixed(2)}
                    </td>
                    <td className={TD}>
                      <Badge status={r.status} />
                    </td>

                    <td className={TD}>
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {editing ? (
                          <>
                            <button
                              onClick={() => saveEdit(r.rental_id)}
                              className={
                                "inline-flex items-center gap-1 rounded-md bg-emerald-50 " +
                                "border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold " +
                                "text-emerald-700 hover:bg-emerald-100 transition-colors"
                              }
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                            <button
                              onClick={() => cancelEdit(r.rental_id)}
                              className={
                                "inline-flex items-center gap-1 rounded-md bg-gray-50 " +
                                "border border-gray-200 px-2.5 py-1.5 text-xs font-semibold " +
                                "text-gray-600 hover:bg-gray-100 transition-colors"
                              }
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className={
                                "inline-flex items-center gap-1 rounded-md bg-indigo-50 " +
                                "border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold " +
                                "text-indigo-700 hover:bg-indigo-100 transition-colors"
                              }
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.rental_id)}
                              className={
                                "inline-flex items-center gap-1 rounded-md bg-red-50 " +
                                "border border-red-200 px-2.5 py-1.5 text-xs font-semibold " +
                                "text-red-600 hover:bg-red-100 transition-colors"
                              }
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
