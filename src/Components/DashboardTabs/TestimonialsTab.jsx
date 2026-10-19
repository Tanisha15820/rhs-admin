import { useState, useRef } from "react";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";

// Storage helpers and preset colors
import {
  getAllTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  resetTestimonials,
  TESTIMONIAL_BG_OPTIONS,
} from "../../utils/testimonialStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

// Preset doctor avatars
const PRESET_AVATARS = [
  { label: "Doctor 1", url: "https://i.pravatar.cc/100?img=47" },
  { label: "Doctor 2", url: "https://i.pravatar.cc/100?img=12" },
  { label: "Doctor 3", url: "https://i.pravatar.cc/100?img=32" },
  { label: "Doctor 4", url: "https://i.pravatar.cc/100?img=60" },
  { label: "Doctor 5", url: "https://i.pravatar.cc/100?img=49" },
  { label: "Doctor 6", url: "https://i.pravatar.cc/100?img=68" },
];

/**
 * TestimonialsTab Component
 * Simple, beginner-friendly component to manage client and doctor testimonials.
 * Supports: Listing cards, Adding new reviews, Editing existing ones, and Deleting.
 */
function TestimonialsTab({ testimonials, setTestimonials, showNotify }) {
  // Modal states
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input for uploading custom photo
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // 1. OPEN MODAL FOR NEW TESTIMONIAL
  // -------------------------------------------------------------
  const openNewTestimonialModal = () => {
    setEditingTestimonial({
      id: "new",
      name: "Dr. Sarah Mitchell",
      role: "Orthopedic Surgeon, Riverdale Health",
      text: "The quality of these medical devices is outstanding. They're reliable, easy to use, and significantly improve patient outcomes.",
      image: "https://i.pravatar.cc/100?img=47",
      bg: "bg-[#EDE9FE]",
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR EDITING
  // -------------------------------------------------------------
  const openEditTestimonialModal = (item) => {
    setEditingTestimonial({ ...item });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. SAVE TESTIMONIAL (ADD OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveTestimonial = (e) => {
    e.preventDefault();
    if (!editingTestimonial) return;

    if (editingTestimonial.id === "new") {
      const updatedList = addTestimonial(editingTestimonial);
      setTestimonials(updatedList);
      showNotify("New testimonial card added successfully!");
    } else {
      const updatedList = updateTestimonial(editingTestimonial.id, editingTestimonial);
      setTestimonials(updatedList);
      showNotify("Testimonial card updated successfully!");
    }

    setIsModalOpen(false);
    setEditingTestimonial(null);
  };

  // -------------------------------------------------------------
  // 4. DELETE TESTIMONIAL
  // -------------------------------------------------------------
  const handleDeleteTestimonial = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this testimonial?"
    );
    if (!isConfirmed) return;

    const result = deleteTestimonial(id);
    if (result.success) {
      setTestimonials(result.testimonials);
      if (editingTestimonial?.id === id) setEditingTestimonial(null);
      showNotify("Testimonial deleted successfully.");
    } else {
      showNotify(result.message, "error");
    }
  };

  // -------------------------------------------------------------
  // 5. RESET TESTIMONIALS TO DEFAULT
  // -------------------------------------------------------------
  const handleResetTestimonials = () => {
    const isConfirmed = window.confirm(
      "Reset all testimonials to factory default list?"
    );
    if (!isConfirmed) return;

    const defaults = resetTestimonials();
    setTestimonials(defaults);
    setEditingTestimonial(null);
    showNotify("Testimonials reset to original defaults.");
  };

  // -------------------------------------------------------------
  // 6. UPLOAD CUSTOM AUTHOR PHOTO
  // -------------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFileAsBase64(
      file,
      (base64String) => {
        setEditingTestimonial((prev) => ({
          ...prev,
          image: base64String,
        }));
      },
      (errorMessage) => {
        showNotify(errorMessage, "error");
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RateReviewOutlinedIcon className="text-primary" />
            Homepage Testimonials & Reviews ({testimonials.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the doctor & specialist testimonial cards shown in the &quot;Our Trusted Clients&quot; section on the live homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetTestimonials}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RestartAltOutlinedIcon style={{ fontSize: 18 }} />
            <span>Reset Defaults</span>
          </button>
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

      {/* Testimonial Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <div
            key={item.id || index}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 ${
              item.bg || "bg-[#EDE9FE]"
            }`}
          >
            {/* Top Bar: Card Index & Action Buttons */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs">
                  #{index + 1}
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {item.name}
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
                  disabled={testimonials.length <= 1}
                  onClick={() => handleDeleteTestimonial(item.id)}
                  className="rounded-lg border border-rose-200 bg-white/95 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  title={
                    testimonials.length <= 1
                      ? "At least one card must remain"
                      : "Delete Testimonial"
                  }
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
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Author / Doctor Information */}
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-3">
              <img
                src={item.image || "https://i.pravatar.cc/100?img=47"}
                alt={item.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-slate-900">
                  {item.name}
                </h4>
                <p className="truncate text-[10px] text-slate-600 font-medium">
                  {item.role}
                </p>
              </div>
            </div>

            {/* Footer Live Indicator */}
            <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Live on Homepage</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

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

            <form onSubmit={handleSaveTestimonial} className="mt-6 space-y-4">
              {/* Author Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author / Doctor Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.name || ""}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Dr. Sarah Mitchell"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Title / Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Title, Specialty & Hospital / Organization
                </label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.role || ""}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  placeholder="e.g. Orthopedic Surgeon, Riverdale Health"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Testimonial Quote / Review
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.text || ""}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({
                      ...prev,
                      text: e.target.value,
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
                    const isSelected = editingTestimonial.bg === opt.bgClass;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditingTestimonial((prev) => ({
                            ...prev,
                            bg: opt.bgClass,
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

              {/* Author Photo: Upload or Pick Preset Avatar */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Author Photo / Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/30 overflow-hidden bg-white p-0.5 flex items-center justify-center shadow-xs">
                    <img
                      src={editingTestimonial.image || "https://i.pravatar.cc/100?img=47"}
                      alt={editingTestimonial.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition">
                      <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                      <span>Upload Photo</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Or select a default doctor avatar:
                    </p>
                  </div>
                </div>

                {/* Preset Avatars List */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setEditingTestimonial((prev) => ({
                          ...prev,
                          image: preset.url,
                        }))
                      }
                      className={`relative rounded-full p-0.5 transition cursor-pointer ${
                        editingTestimonial.image === preset.url
                          ? "ring-2 ring-primary ring-offset-2"
                          : "opacity-75 hover:opacity-100"
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTestimonial(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
                >
                  Save Testimonial Card
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
