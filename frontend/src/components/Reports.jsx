import { useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "./Reports.css";

// ── Report metadata ────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id: "report1",
    number: "01",
    title: "Filtered Driver Search",
    description:
      "Search drivers by any combination of license type, status, sex, and age range. All fields are optional.",
    params: [
      {
        key: "license_type",
        label: "License Type",
        placeholder: "e.g. Non-Professional",
      },
      {
        key: "license_status",
        label: "License Status",
        placeholder: "e.g. Active",
      },
      { key: "sex", label: "Sex", placeholder: "e.g. Male" },
      {
        key: "min_age",
        label: "Min Age",
        placeholder: "e.g. 18",
        type: "number",
      },
      {
        key: "max_age",
        label: "Max Age",
        placeholder: "e.g. 60",
        type: "number",
      },
    ],
    allOptional: true,
    buildUrl: (p) => {
      const query = new URLSearchParams();
      if (p.license_type?.trim())
        query.set("license_type", p.license_type.trim());
      if (p.license_status?.trim())
        query.set("license_status", p.license_status.trim());
      if (p.sex?.trim()) query.set("sex", p.sex.trim());
      if (p.min_age?.trim()) query.set("min_age", p.min_age.trim());
      if (p.max_age?.trim()) query.set("max_age", p.max_age.trim());
      return `/api/reports/report1?${query.toString()}`;
    },
  },
  {
    id: "report2",
    number: "02",
    title: "Driver Profile by License",
    description:
      "Look up a single driver's complete record using their LTO license number.",
    params: [
      {
        key: "license_number",
        label: "License Number",
        placeholder: "e.g. N01-23-456789",
      },
    ],
    buildUrl: (p) => `/api/reports/report2/${p.license_number}`,
  },
  {
    id: "report3",
    number: "03",
    title: "Registrations Expiring By Date",
    description:
      "List all vehicle registrations that expire on or before the given date.",
    params: [
      {
        key: "expiration_date",
        label: "Expiration Date",
        placeholder: "YYYY-MM-DD",
        type: "date",
      },
    ],
    buildUrl: (p) => `/api/reports/report3/${p.expiration_date}`,
  },
  {
    id: "report4",
    number: "04",
    title: "Drivers by License Status",
    description:
      "Return all drivers matching a specific license status, e.g. Suspended, Expired, Revoked.",
    params: [
      {
        key: "license_status",
        label: "License Status",
        placeholder: "e.g. Suspended",
      },
    ],
    buildUrl: (p) => `/api/reports/report4/${p.license_status}`,
  },
  {
    id: "report5",
    number: "05",
    title: "Violations by Driver & Date Range",
    description:
      "Pull every citation issued to a specific driver within a custom start–end window.",
    params: [
      {
        key: "license_number",
        label: "License Number",
        placeholder: "e.g. N01-23-456789",
      },
      {
        key: "start_date",
        label: "Start Date",
        placeholder: "YYYY-MM-DD",
        type: "date",
      },
      {
        key: "end_date",
        label: "End Date",
        placeholder: "YYYY-MM-DD",
        type: "date",
      },
    ],
    buildUrl: (p) =>
      `/api/reports/report5/${p.license_number}/${p.start_date}/${p.end_date}`,
  },
  {
    id: "report6",
    number: "06",
    title: "Annual Citations Summary",
    description:
      "Aggregate traffic violation data broken down by month for a given calendar year.",
    params: [
      { key: "year", label: "Year", placeholder: "e.g. 2024", type: "number" },
    ],
    buildUrl: (p) => `/api/reports/report6/${p.year}`,
  },
  {
    id: "report7",
    number: "07",
    title: "Violations by Location",
    description:
      "Show all incidents recorded at a specific location or enforcement zone.",
    params: [{ key: "location", label: "Location", placeholder: "e.g. Pasig" }],
    buildUrl: (p) => `/api/reports/report7/${encodeURIComponent(p.location)}`,
  },
  {
    id: "generalQuery",
    number: "GQ",
    title: "General SELECT Query",
    description:
      "Run a custom SQL SELECT statement directly against the registry database.",
    params: [],
    buildUrl: () => "/api/reports/generalQuery",
  },
];

// ── Utility: derive columns automatically from first row ───────────────────────
function deriveColumns(rows) {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0]).map((key) => ({
    accessorKey: key,
    header: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    cell: (info) => {
      const val = info.getValue();
      if (val === null || val === undefined)
        return <span className="cell-null">—</span>;
      // Format ISO dates
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val))
        return new Date(val).toLocaleDateString("en-PH");
      // Format numbers that look like currency
      if (
        key.toLowerCase().includes("fine") ||
        key.toLowerCase().includes("amount")
      )
        return `₱${parseFloat(val).toLocaleString()}`;
      return String(val);
    },
  }));
}

// ── Results Table ──────────────────────────────────────────────────────────────
function ResultsTable({ data }) {
  const [sorting, setSorting] = useState([]);
  const columns = deriveColumns(data);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="results-section">
      <div className="results-meta">
        <span>
          {data.length} row{data.length !== 1 ? "s" : ""} returned
        </span>
      </div>
      <div className="scrollable-table-wrapper">
        <table className="registry-mini-table results-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={h.column.getCanSort() ? "sortable-th" : ""}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" && " ↑"}
                    {h.column.getIsSorted() === "desc" && " ↓"}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="pagination-bar">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Prev
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Reports() {
  const [activeId, setActiveId] = useState(null);
  const [result, setResult] = useState(null); // { rows, error, loading }

  const handleActivate = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
    setResult(null); // clear results when switching cards
  };

  return (
    <div className="master-registry-container">
      <div className="master-registry-inner">
        <div className="registry-search-banner reports-banner">
          <h2>LTO Report Generator</h2>
          <p>
            Select a report below to configure parameters and pull live data
            from the registry.
          </p>
        </div>

        <div className="reports-stack">
          {REPORTS.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isActive={activeId === report.id}
              onActivate={handleActivate}
              onResult={setResult}
            />
          ))}
        </div>

        {/* Results rendered outside cards */}
        {result && (
          <div className="report-results-panel">
            {result.error && (
              <div className="registry-error-notice">{result.error}</div>
            )}
            {result.rows && result.rows.length === 0 && (
              <p className="fallback-empty-text" style={{ color: "#047857" }}>
                No records found for the given parameters.
              </p>
            )}
            {result.rows && result.rows.length > 0 && (
              <ResultsTable data={result.rows} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function ReportCard({ report, isActive, onActivate, onResult }) {
  const [params, setParams] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!report.allOptional) {
      for (const p of report.params) {
        if (!params[p.key]?.trim()) {
          onResult({ error: `"${p.label}" is required.`, rows: null });
          return;
        }
      }
    }
    onResult({ error: "", rows: null, loading: true });
    try {
      const url = report.buildUrl(params);
      const { data } = await axios.get(url);
      const rows = Array.isArray(data)
        ? data
        : (data.data ?? data.result ?? []);
      onResult({ error: "", rows });
    } catch (err) {
      onResult({
        error: err?.response?.data?.message || err.message || "Request failed.",
        rows: null,
      });
    }
  };

  const handleGeneralQuery = async () => {
    if (!params.sql?.trim()) {
      onResult({ error: "Please enter a SQL query.", rows: null });
      return;
    }
    if (!/^\s*(SELECT|DESC|SHOW)/i.test(params.sql)) {
      onResult({
        error: "Only SELECT, DESC, and SHOW statements are allowed.",
        rows: null,
      });
      return;
    }
    onResult({ error: "", rows: null, loading: true });
    try {
      const { data } = await axios.post("/api/generalQuery", {
        query: params.sql,
      });
      const rows = Array.isArray(data)
        ? data
        : (data.data ?? data.result ?? []);
      onResult({ error: "", rows });
    } catch (err) {
      onResult({
        error: err?.response?.data?.message || err.message || "Query failed.",
        rows: null,
      });
    }
  };

  return (
    <div
      className={`report-card ${isActive ? "report-card--active" : ""}`}
      onClick={() => onActivate(report.id)}
    >
      <div className="report-card-header">
        <span className="report-number">RPT-{report.number}</span>
        <div className="report-title-group">
          <h3 className="report-title">{report.title}</h3>
          <p className="report-desc">{report.description}</p>
        </div>
        <span className={`report-chevron ${isActive ? "open" : ""}`}>›</span>
      </div>

      {isActive && (
        <div className="report-card-body" onClick={(e) => e.stopPropagation()}>
          {report.id === "generalQuery" ? (
            <>
              <div className="param-field" style={{ marginBottom: 14 }}>
                <label>SQL Query</label>
                <textarea
                  className="sql-textarea"
                  rows={5}
                  placeholder="SELECT * FROM drivers WHERE ..."
                  value={params.sql || ""}
                  onChange={(e) => setParams({ sql: e.target.value })}
                />
              </div>
              <button
                className="run-report-btn"
                onClick={handleGeneralQuery}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Running…
                  </>
                ) : (
                  <>▶ Run Query</>
                )}
              </button>
            </>
          ) : (
            <>
              {report.params.length > 0 && (
                <div className="report-params-row">
                  {report.params.map((p) => (
                    <div key={p.key} className="param-field">
                      <label>{p.label}</label>
                      <input
                        type={p.type || "text"}
                        placeholder={p.placeholder}
                        value={params[p.key] || ""}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            [p.key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                className="run-report-btn"
                onClick={handleRun}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Running…
                  </>
                ) : (
                  <>▶ Run Report</>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
