import { useState, useEffect, useMemo } from "react";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import {
  fetchMachineQueries,
  updateProductEnquiryStatus,
  updateProductEnquiryNotes,
  ENQUIRY_STATUS_OPTIONS,
} from "../../services/productEnquiryService";

/**
 * ProductEnquiriesTab (Machine Queries Dashboard Page)
 *
 * Displays Product Enquiry / Machine Query submissions saved in the SQL Server
 * `dbo.machine_queries` table from `rhs/src/Pages/ProductEnquiry.jsx`:
 * - Date/Time (`created_at`)
 * - Machine / Product Name (`machine_name`, `products`)
 * - Customer Name (`user_name` / `name`) & Hospital/Clinic/Company (`hospital`)
 * - Contact Info (`user_phone` / `contact`, `user_email` / `email`)
 * - Location (`address`, `city`, `state`, `pinCode`, `country`)
 * - Query Details (`query_reason` / `details`)
 * - Status & Internal Admin Notes
 */
function ProductEnquiriesTab({ showNotify }) {
  const [enquiries, setEnquiries] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Detail Modal state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetchMachineQueries();
      const loaded = res.enquiries || res.queries || res.data || [];
      setEnquiries(loaded);
      if (Array.isArray(res.machineNames)) {
        setAvailableMachines(res.machineNames);
      }
      window.dispatchEvent(new Event("rhs_machine_queries_updated"));
    } catch (err) {
      console.error("Failed to load machine queries:", err);
      const msg =
        err.message || "Failed to load machine queries from the server.";
      setErrorMessage(msg);
      if (showNotify) showNotify(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct machine / product names for dropdown filter
  const machineOptions = useMemo(() => {
    const set = new Set(availableMachines);
    enquiries.forEach((item) => {
      if (item.machine_name) set.add(item.machine_name);
      if (Array.isArray(item.products)) {
        item.products.forEach((p) => {
          if (p.name) set.add(p.name);
        });
      }
    });
    return Array.from(set).sort();
  }, [availableMachines, enquiries]);

  // Filtered records
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        (item.machine_name && item.machine_name.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.user_name && item.user_name.toLowerCase().includes(q)) ||
        (item.hospital && item.hospital.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.user_email && item.user_email.toLowerCase().includes(q)) ||
        (item.contact && item.contact.toLowerCase().includes(q)) ||
        (item.user_phone && item.user_phone.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        (item.state && item.state.toLowerCase().includes(q)) ||
        (item.pinCode && item.pinCode.toLowerCase().includes(q)) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        (item.query_reason && item.query_reason.toLowerCase().includes(q)) ||
        (Array.isArray(item.products) &&
          item.products.some(
            (p) => p.name && p.name.toLowerCase().includes(q)
          ));

      const matchesMachine =
        machineFilter === "All" ||
        item.machine_name === machineFilter ||
        (Array.isArray(item.products) &&
          item.products.some((p) => p.name === machineFilter));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesMachine && matchesStatus;
    });
  }, [enquiries, searchQuery, machineFilter, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    const previousEnquiries = [...enquiries];
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await updateProductEnquiryStatus(id, newStatus);
      if (showNotify) {
        showNotify(`Enquiry status updated to "${newStatus}"`, "success");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setEnquiries(previousEnquiries);
      if (showNotify) {
        showNotify(err.message || "Failed to update status", "error");
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setIsSavingNotes(true);
    try {
      await updateProductEnquiryNotes(selectedEnquiry.id, modalAdminNotes);
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === selectedEnquiry.id
            ? { ...item, adminNotes: modalAdminNotes, admin_notes: modalAdminNotes }
            : item
        )
      );
      setSelectedEnquiry((prev) => ({
        ...prev,
        adminNotes: modalAdminNotes,
        admin_notes: modalAdminNotes,
      }));
      if (showNotify) showNotify("Admin notes saved successfully", "success");
    } catch (err) {
      console.error("Save notes error:", err);
      if (showNotify) {
        showNotify(err.message || "Failed to save admin notes", "error");
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const openDetailModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalAdminNotes(enquiry.adminNotes || enquiry.admin_notes || "");
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setMachineFilter("All");
    setStatusFilter("All");
  };

  const hasActiveFilters =
    Boolean(searchQuery) || machineFilter !== "All" || statusFilter !== "All";

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20";
      case "Contacted":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20";
      case "In Progress":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(isoString);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(isoString);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Machine Queries
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {enquiries.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Review product and machine enquiries submitted through the main RHS website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Reload enquiries from database"
          >
            <RefreshOutlinedIcon
              style={{ fontSize: 16 }}
              className={isLoading ? "animate-spin text-primary" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchOutlinedIcon
              style={{ fontSize: 18 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, hospital, machine/product, phone, email, or city..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FilterListOutlinedIcon style={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            {/* Machine Name Filter */}
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              aria-label="Filter by Machine Name"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-primary cursor-pointer max-w-[210px] truncate"
            >
              <option value="All">All Machines / Products</option>
              {machineOptions.map((mName) => (
                <option key={mName} value={mName}>
                  {mName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {ENQUIRY_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredEnquiries.length}
            </strong>{" "}
            of {enquiries.length} machine queries
          </span>
          {hasActiveFilters && (
            <span className="font-medium text-amber-600">
              Filtered results active
            </span>
          )}
        </div>
      </div>

      {/* DATA TABLE WITH LOADING, ERROR, AND EMPTY STATES */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <RefreshOutlinedIcon
              className="animate-spin text-primary"
              style={{ fontSize: 32 }}
            />
            <p className="text-xs font-medium text-slate-500">
              Loading machine queries from database...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ErrorOutlineOutlinedIcon style={{ fontSize: 26 }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Unable to load machine queries
              </p>
              <p className="mt-1 max-w-md text-xs text-rose-600">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark cursor-pointer"
            >
              <RefreshOutlinedIcon style={{ fontSize: 15 }} />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PrecisionManufacturingOutlinedIcon style={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                No machine queries found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {hasActiveFilters
                  ? "Try adjusting your search criteria or resetting the active filters."
                  : "No product or machine enquiries have been submitted yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-primary-dark cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600">
                  <th className="py-3.5 pl-4 pr-3">Date/Time</th>
                  <th className="py-3.5 px-3">Machine / Products</th>
                  <th className="py-3.5 px-3">Customer & Hospital</th>
                  <th className="py-3.5 px-3">Contact Info (Phone/Email)</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Query Details</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((enquiry) => {
                  const customerName =
                    enquiry.name || enquiry.user_name || "Anonymous Customer";
                  const customerPhone =
                    enquiry.contact || enquiry.user_phone || "";
                  const customerEmail =
                    enquiry.email || enquiry.user_email || "";
                  const queryText =
                    enquiry.details ||
                    enquiry.query_reason ||
                    enquiry.message ||
                    "No details provided";
                  const submittedTime =
                    enquiry.created_at || enquiry.submittedAt;

                  return (
                    <tr
                      key={enquiry.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      {/* Date/Time */}
                      <td className="py-3.5 pl-4 pr-3 align-top whitespace-nowrap">
                        <div className="text-[11px] text-slate-600">
                          <span className="font-mono text-[10px] font-semibold text-slate-400 block">
                            #{enquiry.id}
                          </span>
                          <p className="font-semibold text-slate-800">
                            {formatDate(submittedTime)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatTime(submittedTime)}
                          </p>
                        </div>
                      </td>

                      {/* Machine / Products */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {Array.isArray(enquiry.products) &&
                          enquiry.products.length > 0 ? (
                            enquiry.products.map((p, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                              >
                                <span className="font-semibold text-primary">
                                  {p.name}
                                </span>
                                {p.quantity > 1 && (
                                  <span className="rounded bg-primary/15 px-1 text-[10px] font-bold text-primary">
                                    ×{p.quantity}
                                  </span>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {enquiry.machine_name || "Medical Equipment"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & Hospital */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {customerName
                              .replace(/^Dr\.\s*/i, "")
                              .trim()
                              .charAt(0)
                              .toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {customerName}
                            </p>
                            {enquiry.hospital && (
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                <BusinessOutlinedIcon style={{ fontSize: 13 }} />
                                <span className="font-medium text-slate-700">
                                  {enquiry.hospital}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Phone/Email) */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="space-y-1">
                          {customerPhone && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-800">
                                {customerPhone}
                              </span>
                              <a
                                href={`tel:${customerPhone.replace(/\D/g, "")}`}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-primary transition"
                                title="Call customer phone"
                              >
                                <PhoneOutlinedIcon style={{ fontSize: 14 }} />
                              </a>
                            </div>
                          )}

                          {customerEmail ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="truncate max-w-[160px] text-[11px] text-slate-500"
                                title={customerEmail}
                              >
                                {customerEmail}
                              </span>
                              <a
                                href={`mailto:${customerEmail}?subject=Product Enquiry Quotation - Reinforce Healthcare Services`}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                                title="Send email"
                              >
                                <EmailOutlinedIcon style={{ fontSize: 14 }} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No email
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="text-[11px] text-slate-600">
                          <p className="font-medium text-slate-800">
                            {enquiry.city || "—"}
                            {enquiry.state ? `, ${enquiry.state}` : ""}
                          </p>
                          <p className="text-slate-400">
                            {enquiry.pinCode
                              ? `PIN: ${enquiry.pinCode}`
                              : enquiry.country || "INDIA"}
                          </p>
                        </div>
                      </td>

                      {/* Query Details */}
                      <td className="py-3.5 px-3 align-top max-w-xs">
                        <p className="line-clamp-2 text-xs text-slate-700 leading-relaxed">
                          {queryText}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 align-top">
                        <select
                          value={enquiry.status || "New"}
                          onChange={(e) =>
                            handleStatusChange(enquiry.id, e.target.value)
                          }
                          aria-label={`Status for enquiry ${enquiry.id}`}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold outline-none transition cursor-pointer ${getStatusBadgeStyle(
                            enquiry.status || "New"
                          )}`}
                        >
                          {ENQUIRY_STATUS_OPTIONS.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-white text-slate-800"
                            >
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-4 text-right align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openDetailModal(enquiry)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 cursor-pointer"
                        >
                          <VisibilityOutlinedIcon style={{ fontSize: 14 }} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShoppingCartOutlinedIcon style={{ fontSize: 22 }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Machine / Product Enquiry #{selectedEnquiry.id}
                    </h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeStyle(
                        selectedEnquiry.status || "New"
                      )}`}
                    >
                      {selectedEnquiry.status || "New"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Submitted on{" "}
                    {formatDateTime(
                      selectedEnquiry.created_at || selectedEnquiry.submittedAt
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <BusinessOutlinedIcon
                      style={{ fontSize: 16 }}
                      className="text-primary"
                    />
                    Customer & Hospital Info
                  </h4>
                  <dl className="mt-3 divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Customer Name:</dt>
                      <dd className="font-semibold text-slate-900">
                        {selectedEnquiry.name || selectedEnquiry.user_name || "N/A"}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">
                        Hospital / Clinic / Company:
                      </dt>
                      <dd className="font-semibold text-slate-900 text-right">
                        {selectedEnquiry.hospital || "N/A"}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Email Address:</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedEnquiry.email || selectedEnquiry.user_email ? (
                          <a
                            href={`mailto:${
                              selectedEnquiry.email || selectedEnquiry.user_email
                            }`}
                            className="text-primary hover:underline"
                          >
                            {selectedEnquiry.email || selectedEnquiry.user_email}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Contact Number:</dt>
                      <dd className="font-medium font-mono text-slate-900">
                        {selectedEnquiry.contact || selectedEnquiry.user_phone || "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <LocationOnOutlinedIcon
                      style={{ fontSize: 16 }}
                      className="text-primary"
                    />
                    Address & Location Details
                  </h4>
                  <dl className="mt-3 divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Address:</dt>
                      <dd className="font-medium text-slate-800 text-right max-w-[200px]">
                        {selectedEnquiry.address || "N/A"}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">City & State:</dt>
                      <dd className="font-semibold text-slate-900">
                        {selectedEnquiry.city || "—"}
                        {selectedEnquiry.state ? `, ${selectedEnquiry.state}` : ""}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Pin Code:</dt>
                      <dd className="font-mono font-semibold text-slate-900">
                        {selectedEnquiry.pinCode || selectedEnquiry.pin_code || "N/A"}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-500">Country:</dt>
                      <dd className="font-medium text-slate-800">
                        {selectedEnquiry.country || "INDIA"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Selected Products Section */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <MedicalServicesOutlinedIcon
                      style={{ fontSize: 16 }}
                      className="text-primary"
                    />
                    Selected Healthcare Products / Machines
                  </h4>
                  <span className="text-xs font-medium text-slate-500">
                    {Array.isArray(selectedEnquiry.products)
                      ? selectedEnquiry.products.length
                      : 1}{" "}
                    items requested
                  </span>
                </div>
                <div className="p-4">
                  {Array.isArray(selectedEnquiry.products) &&
                  selectedEnquiry.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEnquiry.products.map((prod, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <MedicalServicesOutlinedIcon
                                style={{ fontSize: 20 }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Healthcare Equipment
                              </p>
                            </div>
                          </div>
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            Qty: {prod.quantity || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedEnquiry.machine_name || "Medical Equipment"}
                    </p>
                  )}
                </div>
              </div>

              {/* Enquiry Details */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <DescriptionOutlinedIcon
                    style={{ fontSize: 16 }}
                    className="text-primary"
                  />
                  Customer Requirements & Details
                </h4>
                <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {selectedEnquiry.details ||
                    selectedEnquiry.query_reason ||
                    selectedEnquiry.message ||
                    "No additional details provided by customer."}
                </div>
              </div>

              {/* Status & Admin Notes */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <EditNoteOutlinedIcon
                      style={{ fontSize: 18 }}
                      className="text-primary"
                    />
                    Internal Admin Processing & Remarks
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Current Status:
                    </label>
                    <select
                      value={selectedEnquiry.status || "New"}
                      onChange={(e) =>
                        handleStatusChange(selectedEnquiry.id, e.target.value)
                      }
                      className={`rounded-lg border px-3 py-1 text-xs font-bold outline-none cursor-pointer ${getStatusBadgeStyle(
                        selectedEnquiry.status || "New"
                      )}`}
                    >
                      {ENQUIRY_STATUS_OPTIONS.map((st) => (
                        <option
                          key={st}
                          value={st}
                          className="bg-white text-slate-800"
                        >
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Internal Follow-up Notes (Saved to SQL Server):
                  </label>
                  <textarea
                    rows={3}
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Add follow-up notes, quotation status, or client requirements..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingNotes ? "Saving..." : "Save Admin Notes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
              <span className="font-mono text-[11px] text-slate-500">
                ID: #{selectedEnquiry.id}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
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

export default ProductEnquiriesTab;
