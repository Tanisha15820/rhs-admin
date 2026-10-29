import { useState, useEffect, useRef, useCallback } from "react";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import CircularProgress from "@mui/material/CircularProgress";

// Data helpers and storage constants
import {
  getAllNewsletters,
  addNewsletter,
  updateNewsletter,
  deleteNewsletter,
  setSpotlightEdition,
  NEWSLETTER_CATEGORIES,
} from "../../utils/newsletterStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

/**
 * NewsletterTab Component
 * Dynamic CRUD interface for Reinforce Healthcare Services (RHS) Newsletter Editions.
 * Completely aligned in comprehensive data structure, layout, card structure,
 * table columns, and Add/Edit popup forms with the Blogs page and RHS Newsletter website.
 */
export default function NewsletterTab({ showNotify, onNewslettersChanged }) {
  // Editions list state
  const [newsletters, setNewsletters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View mode toggle: 'grid' or 'table'
  const [viewMode, setViewMode] = useState("grid");

  // Modal and form states
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Quick reader preview modal state
  const [previewItem, setPreviewItem] = useState(null);

  // Delete confirmation dialog state
  const [deletingId, setDeletingId] = useState(null);

  // Hidden file input reference
  const fileInputRef = useRef(null);

  // Notify parent dashboard and global listeners
  const notifyChange = useCallback(() => {
    if (onNewslettersChanged) {
      onNewslettersChanged();
    }
    window.dispatchEvent(new CustomEvent("rhs_newsletters_updated"));
  }, [onNewslettersChanged]);

  // Load items from storage
  const loadNewsletters = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getAllNewsletters();
      setNewsletters(data);
    } catch (err) {
      console.error("Failed to load newsletters:", err);
      showNotify?.("Failed to load newsletter editions.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    loadNewsletters();
    const handleStorageUpdate = () => loadNewsletters();
    window.addEventListener("rhs_newsletters_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("rhs_newsletters_updated", handleStorageUpdate);
    };
  }, [loadNewsletters]);

  // Open modal for new item
  const openNewModal = () => {
    setFormError("");
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    setEditingItem({
      id: "new",
      title: "",
      vol: `Vol. ${newsletters.length + 11} • Issue 0${new Date().getMonth() + 1}`,
      category: "Surgical Lasers on Rent",
      subtitle: "",
      summary: "",
      description: "",
      image: "",
      date: currentDate,
      readTime: "6 min read",
      pages: "12 Pages PDF",
      highlightsText: "",
      editorNote: "",
      sectionsText: "",
      keyQuote: "",
      status: "Active",
      isSpotlight: newsletters.length === 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (item) => {
    setFormError("");
    const highlights = Array.isArray(item.highlights)
      ? item.highlights.join("\n")
      : typeof item.highlights === "string"
      ? item.highlights
      : "";

    const sectionsText =
      Array.isArray(item.fullContent?.sections) && item.fullContent.sections.length > 0
        ? item.fullContent.sections
            .map((s) => `${s.heading ? s.heading + "\n" : ""}${s.body || ""}`)
            .join("\n\n")
        : "";

    setEditingItem({
      id: item.id,
      title: item.title || "",
      vol: item.vol || "Vol. 14 • Issue 10",
      category: item.category || "Surgical Lasers on Rent",
      subtitle: item.subtitle || "",
      summary: item.summary || item.description || "",
      description: item.description || item.summary || "",
      image: item.image || "",
      date: item.date || "",
      readTime: item.readTime || "6 min read",
      pages: item.pages || "12 Pages PDF",
      highlightsText: highlights,
      editorNote: item.fullContent?.editorNote || item.editorNote || "",
      sectionsText: sectionsText,
      keyQuote: item.fullContent?.keyQuote || item.keyQuote || "",
      status: item.status || "Active",
      isSpotlight: Boolean(item.isSpotlight || item.featured),
    });
    setIsModalOpen(true);
  };

  // Handle local image file upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image file size must be less than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    readFileAsBase64(
      file,
      (base64Data) => {
        setEditingItem((prev) => ({ ...prev, image: base64Data }));
      },
      (errorMsg) => {
        setFormError(errorMsg);
      }
    );
  };

  // Quick handler to designate spotlight edition
  const handleSetSpotlight = (item) => {
    setSpotlightEdition(item.id);
    showNotify?.(
      `"${item.title.substring(0, 26)}..." is now set as Featured in Spotlight!`,
      "success"
    );
    loadNewsletters();
    notifyChange();
  };

  // Save (Create or Update)
  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");

    if (!editingItem.title?.trim()) {
      setFormError("Please enter a newsletter edition title.");
      return;
    }

    if (!editingItem.summary?.trim() && !editingItem.description?.trim()) {
      setFormError("Please enter a short description or summary for this edition.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const payload = {
          ...editingItem,
          description: editingItem.summary || editingItem.description,
          summary: editingItem.summary || editingItem.description,
        };

        if (editingItem.id === "new") {
          addNewsletter(payload);
          showNotify?.("Newsletter edition created successfully!", "success");
        } else {
          updateNewsletter(editingItem.id, payload);
          showNotify?.("Newsletter edition updated successfully!", "success");
        }
        setIsModalOpen(false);
        setEditingItem(null);
        loadNewsletters();
        notifyChange();
      } catch (err) {
        console.error("Save newsletter error:", err);
        setFormError(err.message || "Failed to save newsletter.");
      } finally {
        setIsSubmitting(false);
      }
    }, 250);
  };

  // Confirm delete
  const handleDelete = (id) => {
    try {
      deleteNewsletter(id);
      showNotify?.("Newsletter edition deleted successfully.", "success");
      setDeletingId(null);
      loadNewsletters();
      notifyChange();
    } catch (err) {
      console.error("Delete newsletter error:", err);
      showNotify?.("Failed to delete newsletter.", "error");
    }
  };

  // Toggle active/inactive status quickly from card or table
  const handleToggleStatus = (item) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    updateNewsletter(item.id, { status: nextStatus });
    showNotify?.(
      `Edition "${item.title.substring(0, 24)}..." marked as ${nextStatus}!`,
      "success"
    );
    loadNewsletters();
    notifyChange();
  };

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* TOP HEADER COMMAND BAR (MATCHING BLOGS & CLIENTS)         */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MarkEmailReadOutlinedIcon className="text-primary" />
            Newsletter Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage B2B medical machinery rental bulletins and hospital equipment dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle: Grid / Table */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ViewModuleOutlinedIcon style={{ fontSize: 16 }} />
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ViewListOutlinedIcon style={{ fontSize: 16 }} />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Newsletter</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LOADING STATE                                             */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200/80 bg-white">
          <CircularProgress size={36} className="text-primary" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading newsletter editions...
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* EMPTY STATE                                               */}
      {/* ========================================================= */}
      {!isLoading && newsletters.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MarkEmailReadOutlinedIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No newsletter editions found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            No newsletter bulletins exist yet. Click Add Newsletter to publish your first edition.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 16 }} />
            <span>Add First Newsletter</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 1: CARDS GRID (MATCHING BLOGS & CLIENTS)        */}
      {/* ========================================================= */}
      {!isLoading && newsletters.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((item, index) => {
            const isSpotlight = Boolean(item.isSpotlight || item.featured);

            return (
              <div
                key={item.id || index}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-2xs hover:shadow-xl transition-all duration-300 ${
                  isSpotlight
                    ? "border-sky-300 ring-2 ring-sky-300/30"
                    : "border-slate-200/80 hover:border-primary/40"
                }`}
              >
                {/* Top Action Bar (Matching BlogsTab & ClientsTab) */}
                <div className="flex items-center justify-between p-4 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      #{index + 1}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 truncate max-w-[120px]">
                      {item.vol || `Vol. 14 • Issue 0${index + 1}`}
                    </span>
                    {isSpotlight && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                        <AutoAwesomeOutlinedIcon style={{ fontSize: 11 }} />
                        Spotlight
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                      title="Edit Newsletter Edition"
                    >
                      <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Newsletter Edition"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Area (16:10 aspect ratio matching website) */}
                <div className="relative mx-4 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <ImageIcon style={{ fontSize: 36 }} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                  {/* Date & Reading Time Badge */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    <CalendarTodayOutlinedIcon style={{ fontSize: 12 }} className="text-sky-300" />
                    <span>{item.date}</span>
                    <span>•</span>
                    <AccessTimeOutlinedIcon style={{ fontSize: 12 }} className="text-sky-300" />
                    <span>{item.readTime || "6 min read"}</span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 pt-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Tag */}
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-primary tracking-wide">
                        {item.category || "Surgical Lasers on Rent"}
                      </span>
                      {item.pages && (
                        <span className="text-[10px] font-medium text-slate-400">
                          • {item.pages}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.subtitle || item.description || item.summary}
                    </p>

                    {/* Highlights bullet count */}
                    {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item.highlights.length} key hospital rental advantages included</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status & Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                  {/* Status Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className="cursor-pointer transition hover:opacity-80"
                      title="Click to toggle publish status"
                    >
                      {item.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Right Actions: Spotlight & Reader Preview */}
                  <div className="flex items-center gap-2">
                    {isSpotlight ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                        <AutoAwesomeOutlinedIcon style={{ fontSize: 12 }} />
                        <span>Spotlight</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetSpotlight(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-sky-700 transition cursor-pointer"
                        title="Designate as Spotlight Edition on website"
                      >
                        <AutoAwesomeOutlinedIcon style={{ fontSize: 12 }} />
                        <span>Set Spotlight</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
                      title="Quick preview edition"
                    >
                      <VisibilityOutlinedIcon style={{ fontSize: 15 }} />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: TABLE COLUMNS (MATCHING ADMIN TABLE PATTERN) */}
      {/* ========================================================= */}
      {!isLoading && newsletters.length > 0 && viewMode === "table" && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Cover</th>
                  <th className="px-4 py-3.5">Edition Title & Subtitle</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Vol & Date</th>
                  <th className="px-4 py-3.5">Read Time</th>
                  <th className="px-4 py-3.5">Spotlight</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newsletters.map((item, index) => {
                  const isSpotlight = Boolean(item.isSpotlight || item.featured);

                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 transition">
                      {/* Index */}
                      <td className="px-4 py-3 font-bold text-slate-400">
                        #{index + 1}
                      </td>

                      {/* Cover Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="h-12 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ImageIcon style={{ fontSize: 18 }} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.subtitle || item.description || item.summary}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {item.category || "Surgical Lasers on Rent"}
                        </span>
                      </td>

                      {/* Vol & Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{item.date}</p>
                        <p className="text-[10px] text-slate-400">{item.vol}</p>
                      </td>

                      {/* Read Time */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {item.readTime || "6 min read"}
                      </td>

                      {/* Spotlight */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isSpotlight ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                            <AutoAwesomeOutlinedIcon style={{ fontSize: 11 }} />
                            Spotlight
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetSpotlight(item)}
                            className="text-[11px] font-medium text-slate-400 hover:text-sky-700 transition cursor-pointer"
                          >
                            Set Spotlight
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="cursor-pointer transition hover:opacity-80"
                        >
                          {item.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-primary hover:bg-primary hover:text-white transition shadow-2xs cursor-pointer"
                            title="Reader Preview"
                          >
                            <VisibilityOutlinedIcon style={{ fontSize: 16 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-primary hover:text-white transition shadow-2xs cursor-pointer"
                            title="Edit"
                          >
                            <EditNoteOutlinedIcon style={{ fontSize: 16 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                            title="Delete"
                          >
                            <DeleteOutlinedIcon style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT NEWSLETTER (COMPREHENSIVE PARITY)       */}
      {/* ========================================================= */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem.id === "new" ? "Add New Newsletter Edition" : "Edit Newsletter Edition"}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage comprehensive fields matching the RHS website newsletter cards and reader modal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Newsletter Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. High-Power Holmium & Thulium Fiber Lasers on Rental..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Category & Volume Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Equipment Category *
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    {NEWSLETTER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volume / Issue */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Edition Volume & Issue
                  </label>
                  <input
                    type="text"
                    value={editingItem.vol || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, vol: e.target.value }))
                    }
                    placeholder="e.g. Vol. 14 • Issue 10"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date, Reading Time & Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Publication Date *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editingItem.date || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, date: e.target.value }))
                      }
                      placeholder="e.g. October 2026"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 pl-9 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                    />
                    <CalendarTodayOutlinedIcon
                      className="absolute left-3 top-2.5 text-slate-400"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                </div>

                {/* Reading Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reading Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editingItem.readTime || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, readTime: e.target.value }))
                      }
                      placeholder="e.g. 6 min read"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 pl-9 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                    />
                    <AccessTimeOutlinedIcon
                      className="absolute left-3 top-2.5 text-slate-400"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                </div>

                {/* Pages Format */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Document Format
                  </label>
                  <input
                    type="text"
                    value={editingItem.pages || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, pages: e.target.value }))
                    }
                    placeholder="e.g. 12 Pages PDF"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Newsletter Cover Graphic
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    {editingItem.image ? (
                      <img
                        src={editingItem.image}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                        <ImageIcon style={{ fontSize: 28 }} />
                        <span className="text-[10px] mt-1">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition">
                        <CloudUploadOutlinedIcon style={{ fontSize: 18 }} />
                        <span>
                          {editingItem.image ? "Replace Cover Image" : "Upload Cover Image"}
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      {editingItem.image && (
                        <button
                          type="button"
                          onClick={() => setEditingItem((prev) => ({ ...prev, image: "" }))}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WebP (Max 5MB). Preserves current image if no file is uploaded.
                    </p>
                  </div>
                </div>
              </div>

              {/* Short Summary / Card Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description / Card Excerpt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.summary || editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      summary: e.target.value,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Provide a concise equipment overview displayed on the newsletter card..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Full Reader Content Section (Matching Blogs Tab) */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Reader Content (Website Reader Modal)
                </span>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bulletin Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={editingItem.subtitle || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g. A comprehensive operational review on acquiring high-precision lasers..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Key Rental & Equipment Advantages / Highlights */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Key Rental & Equipment Advantages for Hospitals (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editingItem.highlightsText || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        highlightsText: e.target.value,
                      }))
                    }
                    placeholder="Zero-CAPEX rental models configured specifically for hospital urology departments&#10;1940nm Superpulsed TFL and 100W Holmium systems delivered ready-to-operate&#10;Dedicated biomedical engineer assistance and fiber supplies included"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* RHS Advisory Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    RHS Rental & Biomedical Advisory Note
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.editorNote || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        editorNote: e.target.value,
                      }))
                    }
                    placeholder="As medical facilities face increasing pressure to upgrade their surgical technology while maintaining operational liquidity..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Detailed Sections Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Full Article / Section Body Content
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.sectionsText || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        sectionsText: e.target.value,
                      }))
                    }
                    placeholder="Enter detailed clinical equipment reviews, operational protocols, and hospital rental case studies..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Testimonial / Quote */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Hospital Surgeon / Partner Review Quote
                  </label>
                  <input
                    type="text"
                    value={editingItem.keyQuote || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, keyQuote: e.target.value }))
                    }
                    placeholder="“Renting high-power surgical lasers from RHS allowed our hospital to launch advanced lithotripsy services immediately...”"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Featured in Spotlight Option */}
              <div className={`rounded-2xl border p-4 transition-all duration-200 ${
                editingItem.isSpotlight
                  ? "border-sky-300 bg-sky-50/80 shadow-xs ring-1 ring-sky-300/50"
                  : "border-slate-200/80 bg-slate-50/60 hover:bg-slate-50"
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      editingItem.isSpotlight
                        ? "bg-gradient-to-br from-primary to-sky-500 text-white shadow-sm shadow-sky-500/30"
                        : "bg-slate-200/80 text-slate-600"
                    }`}>
                      <AutoAwesomeOutlinedIcon style={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="isSpotlightToggle" className="text-xs font-bold text-slate-900 cursor-pointer">
                          Featured in Spotlight
                        </label>
                        {editingItem.isSpotlight && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                            ★ Active Spotlight
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                        Designate this edition to appear prominently at the top spotlight position on the main RHS website's newsletter page.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      id="isSpotlightToggle"
                      type="checkbox"
                      checked={Boolean(editingItem.isSpotlight)}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, isSpotlight: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-sky-500 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Status Option */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={editingItem.status}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Active">Active (Published live)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>

              {/* Action Buttons (Matching BlogsTab & ClientsTab) */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <CircularProgress size={14} className="text-white" />
                  ) : (
                    <CheckCircleOutlinedIcon style={{ fontSize: 18 }} />
                  )}
                  <span>
                    {editingItem.id === "new" ? "Save & Publish Edition" : "Update Edition"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK READER PREVIEW MODAL (MATCHING BLOGS & RHS READER)  */}
      {/* ========================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer"
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </button>

            {/* Header: Vol, Date, Category, Read Time, Pages */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-extrabold uppercase text-primary">
                {previewItem.vol || "Vol. 14 • Issue 10"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <CalendarTodayOutlinedIcon style={{ fontSize: 13 }} />
                Published: {previewItem.date}
              </span>
              <span>•</span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700">
                {previewItem.category || "Surgical Lasers on Rent"}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-medium">
                {previewItem.readTime || "6 min read"}
              </span>
              {previewItem.pages && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-medium">{previewItem.pages}</span>
                </>
              )}
              {(previewItem.isSpotlight || previewItem.featured) && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700">
                    <AutoAwesomeOutlinedIcon style={{ fontSize: 13 }} />
                    Spotlight Edition
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="mt-3.5 text-2xl font-black text-slate-900 sm:text-3xl leading-snug">
              {previewItem.title}
            </h2>

            {/* Subtitle */}
            {previewItem.subtitle && (
              <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                {previewItem.subtitle}
              </p>
            )}

            {/* Cover Graphic */}
            {previewItem.image && (
              <div className="mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                <img
                  src={previewItem.image}
                  alt={previewItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Editor Note Card */}
            {(previewItem.fullContent?.editorNote || previewItem.editorNote) && (
              <div className="mt-6 rounded-2xl border-l-4 border-primary bg-sky-50/60 p-5 text-sm italic leading-relaxed text-slate-700">
                <p className="font-bold text-slate-900 not-italic mb-1 text-xs uppercase tracking-wider">
                  RHS Rental & Biomedical Advisory Note:
                </p>
                &ldquo;{previewItem.fullContent?.editorNote || previewItem.editorNote}&rdquo;
              </div>
            )}

            {/* Highlights Bullets Card */}
            {Array.isArray(previewItem.highlights) && previewItem.highlights.length > 0 && (
              <div className="mt-6 rounded-2xl bg-sky-50/40 p-5 border border-sky-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Key Rental & Equipment Advantages for Hospitals:
                </h4>
                <ul className="space-y-2">
                  {previewItem.highlights.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5 font-bold">
                        ✓
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured Sections */}
            {Array.isArray(previewItem.fullContent?.sections) && previewItem.fullContent.sections.length > 0 ? (
              <div className="mt-6 space-y-4">
                {previewItem.fullContent.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900">{sec.heading}</h3>
                    <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{sec.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              (previewItem.description || previewItem.summary) && (
                <div className="mt-6 rounded-2xl bg-slate-50/70 p-5 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Bulletin Overview & Rental Details:
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {previewItem.description || previewItem.summary}
                  </p>
                </div>
              )
            )}

            {/* Key Surgeon Quote Card */}
            {(previewItem.fullContent?.keyQuote || previewItem.keyQuote) && (
              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white text-center">
                <p className="text-xs font-semibold italic text-sky-200 sm:text-sm">
                  {previewItem.fullContent?.keyQuote || previewItem.keyQuote}
                </p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400 font-medium">
                Status:{" "}
                <strong
                  className={
                    previewItem.status === "Active" ? "text-emerald-600" : "text-slate-500"
                  }
                >
                  {previewItem.status}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = previewItem;
                    setPreviewItem(null);
                    openEditModal(itemToEdit);
                  }}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
                >
                  Edit This Edition
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL                                 */}
      {/* ========================================================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <DeleteOutlinedIcon style={{ fontSize: 28 }} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Delete Newsletter Edition?
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
              Are you sure you want to permanently delete this newsletter edition? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
