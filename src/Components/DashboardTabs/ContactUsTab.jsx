import { useState, useEffect, useMemo, useCallback } from "react";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  fetchContactQueries,
  updateContactQueryStatus,
  fetchBookedDatesSummary,
} from "../../services/contactUsService";

const QUERY_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

/**
 * Normalizes a database record from ContactQueries into a consistent UI object
 */
function normalizeQueryRecord(row) {
  const clientName =
    row.client_name ||
    [row.title, row.firstName, row.lastName].filter(Boolean).join(" ").trim() ||
    "Unknown Client";

  const selectedDate =
    typeof row.selected_date === "string"
      ? row.selected_date.slice(0, 10)
      : row.callDate || "";

  return {
    id: row.id,
    client_name: clientName,
    client_email: row.client_email || row.email || "",
    client_phone: row.client_phone || row.mobile || "",
    query_message: row.query_message || row.requirements || "",
    selected_date: selectedDate,
    status: row.status || "Pending",
    created_at: row.created_at || row.submittedAt || "",
  };
}

/**
 * ContactUsTab Component
 * Admin Dashboard view for "Contact Us Queries" & Date Booking System.
 * Displays all client queries in a clean data table showing:
 * Client Name, Email, Phone, Selected Date, Query Message, Submission Timestamp, and Status.
 */
function ContactUsTab({ showNotify }) {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dateCounts, setDateCounts] = useState({});
  const [maxCapacity, setMaxCapacity] = useState(50);

  // Active sub-tab: 'enquiries' (Queries Table) or 'call-slots' (Date-wise capacity)
  const [activeSubTab, setActiveSubTab] = useState("enquiries");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected query for full detail modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load queries and booked-date counts from backend API
  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setLoadError("");

      try {
        const [queriesRes, bookedRes] = await Promise.all([
          fetchContactQueries(),
          fetchBookedDatesSummary().catch(() => ({
            bookedDates: [],
            dateCounts: {},
            maxCapacity: 50,
          })),
        ]);

        const normalized = (queriesRes.queries || []).map(normalizeQueryRecord);
        setQueries(normalized);
        setDateCounts(bookedRes.dateCounts || {});
        setMaxCapacity(bookedRes.maxCapacity || 50);
      } catch (err) {
        setLoadError(
          err?.message || "Failed to load contact queries from the server."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------
  // 1. FILTERED QUERIES LIST
  // -------------------------------------------------------------
  const filteredQueries = useMemo(() => {
    return queries.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.client_name.toLowerCase().includes(q) ||
        (item.client_email && item.client_email.toLowerCase().includes(q)) ||
        (item.client_phone && item.client_phone.toLowerCase().includes(q)) ||
        item.query_message.toLowerCase().includes(q) ||
        (item.selected_date && item.selected_date.includes(q));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, searchQuery, statusFilter]);

  // -------------------------------------------------------------
  // 3. BUILD DATE QUOTA ROWS FOR CAPACITY VIEW
  // -------------------------------------------------------------
  const quotas = useMemo(() => {
    const countsMap = { ...dateCounts };
    queries.forEach((q) => {
      if (q.selected_date && !(q.selected_date in countsMap)) {
        countsMap[q.selected_date] =
          queries.filter((item) => item.selected_date === q.selected_date)
            .length;
      }
    });

    const dateKeys = Object.keys(countsMap).sort();
    return dateKeys.map((dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = y && m && d ? new Date(y, m - 1, d) : null;
      const dayLabel = dt
        ? dt.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : dateStr;

      return {
        date: dateStr,
        dayLabel,
        bookedCount: Number(countsMap[dateStr] || 0),
        maxCapacity,
      };
    });
  }, [dateCounts, queries, maxCapacity]);

  // -------------------------------------------------------------
  // 4. STATUS UPDATE HANDLER
  // -------------------------------------------------------------
  const handleStatusChange = async (id, newStatus) => {
    const previousQueries = [...queries];

    setQueries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    if (selectedQuery && selectedQuery.id === id) {
      setSelectedQuery((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await updateContactQueryStatus(id, newStatus);
      showNotify?.(`Query #${id} status updated to "${newStatus}".`, "success");
    } catch (err) {
      setQueries(previousQueries);
      showNotify?.(
        err?.message || "Failed to update status on server.",
        "error"
      );
    }
  };

  // -------------------------------------------------------------
  // 5. OPEN DETAIL MODAL
  // -------------------------------------------------------------
  const handleOpenDetailModal = (queryItem) => {
    setSelectedQuery(queryItem);
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 6. STATUS BADGE COLOR HELPER
  // -------------------------------------------------------------
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Pending":
      case "New":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "Contacted":
        return {
          bg: "bg-sky-50",
          text: "text-sky-700",
          border: "border-sky-200",
          dot: "bg-sky-500",
        };
      case "In Progress":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
        };
      case "Completed":
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200",
          dot: "bg-indigo-500",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const getCleanPhoneNumber = (phoneStr) => {
    return (phoneStr || "").replace(/[^0-9]/g, "");
  };

  const getWhatsAppLink = (queryItem) => {
    const rawDigits = getCleanPhoneNumber(queryItem.client_phone);
    const countryNumber = rawDigits.startsWith("91")
      ? rawDigits
      : `91${rawDigits}`;
    const textMsg = `Hello ${queryItem.client_name}, thank you for contacting Reinforce Healthcare Services regarding your query scheduled for ${formatDisplayDate(queryItem.selected_date)}. How can our team assist you?`;

    return `https://wa.me/${countryNumber}?text=${encodeURIComponent(textMsg)}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Not Specified";
    try {
      const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
      if (y && m && d) {
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDisplayDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeStr;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    showNotify?.("Filters reset to default view.", "info");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "All";

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP COMMAND BAR                                        */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ContactPhoneOutlinedIcon className="text-primary" />
            <span>Contact Us Queries</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage client queries and scheduled callback dates (maximum 50 queries per date).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-tab Navigation */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveSubTab("enquiries")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "enquiries"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Queries Table</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary-dark">
                {queries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("call-slots")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "call-slots"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarMonthOutlinedIcon style={{ fontSize: 15 }} />
              <span>Date Booking Capacity (Max 50)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              loadData();
              showNotify?.("Refreshed contact queries from database.", "info");
            }}
            title="Reload queries from database"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshOutlinedIcon style={{ fontSize: 16 }} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB A: CONTACT US QUERIES TABLE & FILTERS             */}
      {/* ========================================================= */}
      {activeSubTab === "enquiries" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <SearchOutlinedIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: 18 }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client name, email, phone, or query message..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <CloseIcon style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="sm:w-60">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-primary focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="All">
                    All Statuses ({queries.length})
                  </option>
                  {QUERY_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer whitespace-nowrap"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {loadError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
              {loadError}
            </div>
          )}

          {/* TABLE CONTAINER */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 sm:px-5">
                      Client Name
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Phone
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Selected Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Query Message
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Submission Timestamp
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:pr-5">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                        Loading contact queries...
                      </td>
                    </tr>
                  ) : (
                    filteredQueries.map((queryItem) => {
                      const statusStyle = getStatusBadgeStyle(queryItem.status);

                      return (
                        <tr
                          key={queryItem.id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          {/* 1. Client Name */}
                          <td className="px-4 py-3.5 sm:px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary-dark/15 text-xs font-bold text-primary-dark">
                                {queryItem.client_name?.[0]?.toUpperCase() || "C"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {queryItem.client_name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  #{queryItem.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Email */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {queryItem.client_email ? (
                              <a
                                href={`mailto:${queryItem.client_email}`}
                                className="flex items-center gap-1.5 text-slate-700 hover:text-primary hover:underline"
                              >
                                <EmailOutlinedIcon
                                  style={{ fontSize: 15 }}
                                  className="text-slate-400"
                                />
                                <span>{queryItem.client_email}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 3. Phone */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {queryItem.client_phone ? (
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <PhoneOutlinedIcon
                                  style={{ fontSize: 15 }}
                                  className="text-primary"
                                />
                                <a
                                  href={`tel:${getCleanPhoneNumber(
                                    queryItem.client_phone
                                  )}`}
                                  className="hover:text-primary hover:underline transition-colors"
                                  title={`Call ${queryItem.client_phone}`}
                                >
                                  {queryItem.client_phone}
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 4. Selected Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {queryItem.selected_date ? (
                              <div className="flex items-center gap-1.5 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 w-fit">
                                <CalendarMonthOutlinedIcon
                                  style={{ fontSize: 14 }}
                                />
                                <span>
                                  {formatDisplayDate(queryItem.selected_date)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                Not Specified
                              </span>
                            )}
                          </td>

                          {/* 5. Query Message */}
                          <td className="px-4 py-3.5 max-w-[280px]">
                            <p
                              className="text-xs text-slate-700 line-clamp-2 leading-relaxed"
                              title={queryItem.query_message}
                            >
                              {queryItem.query_message}
                            </p>
                          </td>

                          {/* 6. Submission Timestamp */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-slate-500">
                            {formatDisplayDateTime(queryItem.created_at)}
                          </td>

                          {/* 7. Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <select
                              value={queryItem.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  queryItem.id,
                                  e.target.value
                                )
                              }
                              className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              title="Click to update status"
                            >
                              {QUERY_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 8. Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap sm:pr-5">
                            <div className="flex items-center justify-end gap-1.5">
                              {queryItem.client_phone && (
                                <>
                                  <a
                                    href={`tel:${getCleanPhoneNumber(
                                      queryItem.client_phone
                                    )}`}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-primary hover:bg-sky-50 hover:text-primary transition cursor-pointer"
                                    title={`Dial ${queryItem.client_phone}`}
                                  >
                                    <PhoneOutlinedIcon
                                      style={{ fontSize: 16 }}
                                    />
                                  </a>

                                  <a
                                    href={getWhatsAppLink(queryItem)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                                    title={`WhatsApp chat with ${queryItem.client_name}`}
                                  >
                                    <WhatsAppIcon style={{ fontSize: 16 }} />
                                  </a>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDetailModal(queryItem)
                                }
                                className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary-dark hover:bg-primary/20 transition cursor-pointer ml-1"
                                title="View full query details"
                              >
                                <VisibilityOutlinedIcon
                                  style={{ fontSize: 15 }}
                                />
                                <span>View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {!isLoading && filteredQueries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <SearchOutlinedIcon style={{ fontSize: 24 }} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-800">
                          No contact queries found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {isFiltered
                            ? "Try adjusting your search criteria or clearing active filters."
                            : "New client queries submitted via the Contact Us page will appear here."}
                        </p>
                        {isFiltered && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-3 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB B: CALL BOOKING OVERVIEW & SLOTS                  */}
      {/* ========================================================= */}
      {activeSubTab === "call-slots" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/70 p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                  Capacity Management System
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 sm:text-lg">
                  Date-Based Call Booking Overview
                </h3>
                <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Reinforce Healthcare Services enforces a strict limit of{" "}
                  <strong>{maxCapacity} queries per date</strong>. Once a date
                  reaches {maxCapacity} queries, it is automatically disabled on
                  the website date picker.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-center shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Max Slot Limit
                  </p>
                  <p className="text-xl font-extrabold text-indigo-700">
                    {maxCapacity}
                  </p>
                  <p className="text-[10px] text-slate-500">per date</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-center shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Dates With Bookings
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700">
                    {quotas.length}
                  </p>
                  <p className="text-[10px] text-slate-500">tracked dates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Call Booking Dates & Remaining Quota
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track date capacity, remaining slots out of {maxCapacity}, and
                  filter queries by date.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Selected Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Queries Booked
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Slot Capacity Bar
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Remaining Slots (out of {maxCapacity})
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Availability Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:pr-5">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quotas.map((quota) => {
                    const remainingSlots = Math.max(
                      0,
                      quota.maxCapacity - quota.bookedCount
                    );
                    const percentBooked = Math.min(
                      100,
                      Math.round((quota.bookedCount / quota.maxCapacity) * 100)
                    );
                    const isFullyBooked =
                      quota.bookedCount >= quota.maxCapacity;
                    const isFillingFast =
                      !isFullyBooked && quota.bookedCount >= 40;

                    let statusBadgeClass =
                      "bg-emerald-50 text-emerald-700 border-emerald-200";
                    let statusText = "Available";
                    let progressBarColor = "bg-emerald-500";

                    if (isFullyBooked) {
                      statusBadgeClass =
                        "bg-rose-50 text-rose-700 border-rose-200";
                      statusText = `Fully Booked (${quota.maxCapacity}/${quota.maxCapacity})`;
                      progressBarColor = "bg-rose-500";
                    } else if (isFillingFast) {
                      statusBadgeClass =
                        "bg-amber-50 text-amber-700 border-amber-200";
                      statusText = "Filling Fast";
                      progressBarColor = "bg-amber-500";
                    }

                    return (
                      <tr
                        key={quota.date}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <CalendarMonthOutlinedIcon
                                style={{ fontSize: 18 }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {quota.dayLabel}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {quota.date}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-extrabold text-slate-800">
                            {quota.bookedCount}
                          </span>
                          <span className="text-xs text-slate-400">
                            {" "}
                            / {quota.maxCapacity} queries
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full max-w-[120px] rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                                style={{ width: `${percentBooked}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">
                              {percentBooked}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`font-bold text-xs ${
                              isFullyBooked
                                ? "text-rose-600"
                                : remainingSlots <= 10
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {remainingSlots}{" "}
                            {remainingSlots === 1 ? "slot" : "slots"} left
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 ${statusBadgeClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isFullyBooked
                                  ? "bg-rose-500"
                                  : isFillingFast
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {statusText}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap sm:pr-5">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(quota.date);
                              setActiveSubTab("enquiries");
                            }}
                            className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary-dark hover:bg-primary/15 transition cursor-pointer"
                          >
                            View Queries for Date
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {quotas.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-xs text-slate-500"
                      >
                        No dates have booked queries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUERY DETAILS MODAL                                    */}
      {/* ========================================================= */}
      {isModalOpen && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ContactPhoneOutlinedIcon style={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Contact Query Details
                    </h3>
                    <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      #{selectedQuery.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Submitted on {formatDisplayDateTime(selectedQuery.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedQuery.status}
                  onChange={(e) =>
                    handleStatusChange(selectedQuery.id, e.target.value)
                  }
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    getStatusBadgeStyle(selectedQuery.status).bg
                  } ${getStatusBadgeStyle(selectedQuery.status).text} ${
                    getStatusBadgeStyle(selectedQuery.status).border
                  }`}
                >
                  {QUERY_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Status: {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <CloseIcon style={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-extrabold text-base shadow-md">
                    {selectedQuery.client_name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {selectedQuery.client_name}
                    </h4>
                    {selectedQuery.client_email && (
                      <p className="text-xs text-slate-600 font-medium">
                        {selectedQuery.client_email}
                      </p>
                    )}
                    {selectedQuery.client_phone && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedQuery.client_phone}
                      </p>
                    )}
                  </div>
                </div>

                {selectedQuery.client_phone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${getCleanPhoneNumber(
                        selectedQuery.client_phone
                      )}`}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary transition"
                    >
                      <PhoneOutlinedIcon style={{ fontSize: 16 }} />
                      <span>Call Now</span>
                    </a>

                    <a
                      href={getWhatsAppLink(selectedQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <WhatsAppIcon style={{ fontSize: 16 }} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Info & Selected Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Client Contact Info
                  </span>
                  <div>
                    <p className="text-[11px] text-slate-400">Email</p>
                    <p className="text-xs font-semibold text-slate-800 break-all">
                      {selectedQuery.client_email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Phone</p>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedQuery.client_phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    Booked Callback Date
                  </span>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <CalendarMonthOutlinedIcon style={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {formatDisplayDate(selectedQuery.selected_date)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Date Key: {selectedQuery.selected_date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Message */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Query Message
                </span>
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedQuery.query_message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <span className="text-[11px] text-slate-400 font-mono">
                ID: #{selectedQuery.id}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactUsTab;
