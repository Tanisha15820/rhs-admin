import { useState, useEffect, useRef, useCallback } from "react";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import {
  fetchTestimonials,
  fetchTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialImage,
} from "../../services/testimonialService";
import {
  TESTIMONIAL_BG_OPTIONS,
  getBgClassFromTheme,
} from "../../utils/testimonialStorage";

/**
 * TestimonialsTab Component
 * Integrates with backend testimonial APIs:
 * - GET /api/testimonials?status=all
 * - GET /api/testimonials/:id
 * - POST /api/testimonials/upload-image
 * - POST /api/testimonials
 * - PUT /api/testimonials/:id
 * - DELETE /api/testimonials/:id
 */
function TestimonialsTab({ showNotify, onTestimonialsChanged }) {
  // Testimonials list state
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal and form states
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  // Hidden file input ref
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // 1. FETCH ALL TESTIMONIALS (GET /api/testimonials?status=all)
  // -------------------------------------------------------------
  const loadTestimonials = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchTestimonials("all");
      setTestimonials(data);
    } catch (err) {
      console.error("Failed to fetch testimonials from server:", err);
      setFetchError(
        err.message || "Failed to load testimonials from server. Please try again."
      );
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const notifyChange = () => {
    if (onTestimonialsChanged) {
      onTestimonialsChanged();
    }
    window.dispatchEvent(new CustomEvent("rhs_testimonials_updated"));
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR NEW TESTIMONIAL
  // -------------------------------------------------------------
  const openNewTestimonialModal = () => {
    setFormError("");
    setEditingTestimonial({
      id: "new",
      author_name: "",
      quote: "",
      bg_theme: "lavender",
      image_url: null,
      cloudinary_public_id: null,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. OPEN MODAL FOR EDITING (GET /api/testimonials/:id)
  // -------------------------------------------------------------
  const openEditTestimonialModal = async (item) => {
    setFormError("");
    // Preliminary populate from clicked card
    setEditingTestimonial({
      id: item.id,
      author_name: item.author_name || "",
      quote: item.quote || "",
      bg_theme: item.bg_theme || "lavender",
      image_url: item.image_url || null,
      cloudinary_public_id: item.cloudinary_public_id || null,
      is_active: Boolean(item.is_active),
    });
    setIsModalOpen(true);
    setIsFetchingDetail(true);

    try {
      // Fetch fresh, full record from backend
      const detail = await fetchTestimonialById(item.id);
      if (detail) {
        setEditingTestimonial({
          id: detail.id,
          author_name: detail.author_name || "",
          quote: detail.quote || "",
          bg_theme: detail.bg_theme || "lavender",
          image_url: detail.image_url || null,
          cloudinary_public_id: detail.cloudinary_public_id || null,
          is_active: Boolean(detail.is_active),
        });
      }
    } catch (err) {
      console.warn("Failed to fetch testimonial by id, using card data:", err);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // -------------------------------------------------------------
  // 4. UPLOAD IMAGE (POST /api/testimonials/upload-image)
  // -------------------------------------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image file size must be less than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFormError("Only JPEG, PNG and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFormError("");
    setIsUploadingImage(true);

    try {
      const uploadResult = await uploadTestimonialImage(file);
      setEditingTestimonial((prev) => ({
        ...prev,
        image_url: uploadResult.image_url,
        cloudinary_public_id: uploadResult.cloudinary_public_id,
      }));
      showNotify?.("Photo uploaded successfully!");
    } catch (err) {
      console.error("Testimonial image upload error:", err);
      setFormError(err.message || "Failed to upload image.");
      showNotify?.(err.message || "Failed to upload image.", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------------------------------------
  // 5. SAVE TESTIMONIAL (POST /api/testimonials or PUT /api/testimonials/:id)
  // -------------------------------------------------------------
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!editingTestimonial || isSubmitting || isUploadingImage) return;

    const trimmedAuthor = (editingTestimonial.author_name || "").trim();
    const trimmedQuote = (editingTestimonial.quote || "").trim();

    if (!trimmedAuthor) {
      setFormError("Please enter the author's name.");
      return;
    }

    if (!trimmedQuote) {
      setFormError("Please enter the testimonial quote / review.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingTestimonial.id === "new") {
        await createTestimonial({
          author_name: trimmedAuthor,
          quote: trimmedQuote,
          bg_theme: editingTestimonial.bg_theme || "lavender",
          image_url: editingTestimonial.image_url || null,
          cloudinary_public_id: editingTestimonial.cloudinary_public_id || null,
          is_active: Boolean(editingTestimonial.is_active),
        });
        showNotify?.("New testimonial card added successfully!");
      } else {
        await updateTestimonial(editingTestimonial.id, {
          author_name: trimmedAuthor,
          quote: trimmedQuote,
          bg_theme: editingTestimonial.bg_theme || "lavender",
          image_url: editingTestimonial.image_url || null,
          cloudinary_public_id: editingTestimonial.cloudinary_public_id || null,
          is_active: Boolean(editingTestimonial.is_active),
        });
        showNotify?.("Testimonial card updated successfully!");
      }

      // Close modal and refresh list
      setIsModalOpen(false);
      setEditingTestimonial(null);
      await loadTestimonials();
      notifyChange();
    } catch (err) {
      console.error("Save testimonial error:", err);
      setFormError(err.message || "Failed to save testimonial.");
      showNotify?.(err.message || "Failed to save testimonial.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 6. DELETE TESTIMONIAL (DELETE /api/testimonials/:id)
  // -------------------------------------------------------------
  const handleDeleteTestimonial = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this testimonial?"
    );
    if (!isConfirmed) return;

    try {
      await deleteTestimonial(id);
      showNotify?.("Testimonial deleted successfully.");
      await loadTestimonials();
      notifyChange();
    } catch (err) {
      console.error("Delete testimonial error:", err);
      showNotify?.(err.message || "Failed to delete testimonial.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RateReviewOutlinedIcon className="text-primary" />
            Testimonials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the doctor & specialist testimonial cards shown in the &quot;Our Trusted Clients&quot; section on the live homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openNewTestimonialModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Testimonial Card</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200/80 bg-white">
          <CircularProgress size={36} className="text-primary" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading testimonials from server...
          </p>
        </div>
      )}

      {/* Fetch error state */}
      {!isLoading && fetchError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-center">
          <p className="text-sm font-bold text-rose-800">
            Unable to connect to testimonial server
          </p>
          <p className="mt-1 text-xs text-rose-600">{fetchError}</p>
          <button
            type="button"
            onClick={() => loadTestimonials()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !fetchError && testimonials.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RateReviewOutlinedIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No testimonials found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            No testimonials exist yet. Click Add Testimonial Card to create one.
          </p>
          <button
            type="button"
            onClick={openNewTestimonialModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 16 }} />
            <span>Add First Testimonial</span>
          </button>
        </div>
      )}

      {/* Testimonial Cards Grid */}
      {!isLoading && !fetchError && testimonials.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => {
            const bgClass = getBgClassFromTheme(item.bg_theme);
            const authorInitial = (item.author_name || "A").trim().charAt(0).toUpperCase();

            return (
              <div
                key={item.id || index}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 ${bgClass}`}
              >
                {/* Top Bar: Card Index & Action Buttons */}
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[150px]">
                      {item.author_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditTestimonialModal(item)}
                      className="rounded-lg border border-slate-200 bg-white/95 p-1 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                      title="Edit Testimonial"
                    >
                      <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="rounded-lg border border-rose-200 bg-white/95 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer shadow-2xs"
                      title="Delete Testimonial"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Quote Icon */}
                <div className="mt-3 flex items-center gap-1 text-primary">
                  <FormatQuoteOutlinedIcon
                    style={{ fontSize: 28 }}
                    className="rotate-180 opacity-70"
                  />
                </div>

                {/* Quote Text */}
                <p className="mt-1 min-h-[85px] text-xs leading-relaxed text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Information */}
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.author_name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 text-primary-dark font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                      {authorInitial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-slate-900">
                      {item.author_name}
                    </h4>
                  </div>
                </div>

                {/* Footer Live Indicator */}
                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Live on Homepage</span>
                  {item.is_active ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT TESTIMONIAL CARD                        */}
      {/* ========================================================= */}
      {isModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingTestimonial.id === "new"
                    ? "Add New Testimonial Card"
                    : "Edit Testimonial Card"}
                </h3>
                <p className="text-xs text-slate-500">
                  Will appear in the &quot;Our Trusted Clients&quot; testimonials section on the Homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTestimonial(null);
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

            {isFetchingDetail && (
              <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium">
                <CircularProgress size={14} className="text-primary" />
                <span>Loading latest details from server...</span>
              </div>
            )}

            <form onSubmit={handleSaveTestimonial} className="mt-6 space-y-4">
              {/* Author Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.author_name || ""}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      author_name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Dr. Sarah Mitchell"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={editingTestimonial.is_active ? "Active" : "Inactive"}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      is_active: e.target.value === "Active",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Testimonial Quote / Review
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote || ""}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      quote: e.target.value,
                    }))
                  }
                  placeholder="Enter the quote text describing their experience with Reinforce Healthcare..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Background Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Background Color Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TESTIMONIAL_BG_OPTIONS.map((opt) => {
                    const isSelected = editingTestimonial.bg_theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditingTestimonial((prev) => ({
                            ...prev,
                            bg_theme: opt.id,
                          }))
                        }
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary-dark ring-2 ring-primary/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: opt.previewHex }}
                        />
                        <span className="truncate text-[11px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author Photo: Upload to Cloudinary */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Author Photo / Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/30 overflow-hidden bg-white p-0.5 flex items-center justify-center shadow-xs">
                    {editingTestimonial.image_url ? (
                      <img
                        src={editingTestimonial.image_url}
                        alt={editingTestimonial.author_name || "Author"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                        {(editingTestimonial.author_name || "A").trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition disabled:opacity-50">
                      {isUploadingImage ? (
                        <>
                          <CircularProgress size={14} className="text-white" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                          <span>Upload Photo</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload a custom photo (JPEG, PNG, or WebP up to 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingImage}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTestimonial(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <CircularProgress size={14} className="text-white" />}
                  <span>Save Testimonial Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestimonialsTab;
