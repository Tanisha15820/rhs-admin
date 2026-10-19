import { useState, useRef } from "react";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

// Storage helpers
import {
  getAllBanners,
  addBannerSlide,
  updateBannerSlide,
  deleteBannerSlide,
  resetBanners,
} from "../../utils/bannerStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

// Default images for preview fallback
import homeBannerDefault from "../../assets/images/home.png";
import homeBg1Default from "../../assets/images/home_bg1.png";

/**
 * BannersTab Component
 * Simple, beginner-friendly component to manage homepage banner slides.
 * Supports: Listing, Adding, Editing, Deleting, and Live Simulation Preview.
 */
function BannersTab({ banners, setBanners, showNotify }) {
  // Currently active slide index in the preview simulator
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Modal states for editing or adding
  const [editingBanner, setEditingBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input reference
  const fileInputRef = useRef(null);

  // Selected banner for preview
  const previewBanner = banners[activeBannerIndex] || banners[0] || {};
  const currentBannerImage =
    previewBanner.image ||
    (activeBannerIndex === 1 ? homeBg1Default : homeBannerDefault);

  // -------------------------------------------------------------
  // 1. OPEN MODAL FOR NEW BANNER
  // -------------------------------------------------------------
  const openNewBannerModal = () => {
    setEditingBanner({
      id: "new",
      image: "",
      smallHeading: "Trusted Healthcare Services",
      headingLine1: "Advanced Medical Equipment",
      headingHighlight: "Better Care.",
      singleLine: false,
      description:
        "Reinforce Healthcare Services provides high-grade medical systems and clinic solutions.",
      primaryBtnText: "Book an Appointment",
      primaryBtnLink: "/contact",
      secondaryBtnText: "Explore Products",
      secondaryBtnLink: "/machine",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR EDITING AN EXISTING BANNER
  // -------------------------------------------------------------
  const openEditBannerModal = (slide) => {
    setEditingBanner({ ...slide });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. SAVE BANNER (CREATE OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveBanner = (e) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (editingBanner.id === "new") {
      // Add new slide
      const updatedList = addBannerSlide(editingBanner);
      setBanners(updatedList);
      showNotify("New homepage banner slide added successfully!");
    } else {
      // Update existing slide
      const updatedList = updateBannerSlide(editingBanner.id, editingBanner);
      setBanners(updatedList);
      showNotify("Banner slide updated successfully!");
    }

    // Close the modal
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  // -------------------------------------------------------------
  // 4. DELETE A BANNER SLIDE
  // -------------------------------------------------------------
  const handleDeleteBanner = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this banner slide?"
    );
    if (!isConfirmed) return;

    const result = deleteBannerSlide(id);
    if (result.success) {
      setBanners(result.slides);
      if (editingBanner?.id === id) setEditingBanner(null);
      showNotify("Banner slide deleted successfully.");
    } else {
      showNotify(result.message, "error");
    }
  };

  // -------------------------------------------------------------
  // 5. RESET TO DEFAULT BANNER SLIDES
  // -------------------------------------------------------------
  const handleResetBanners = () => {
    const isConfirmed = window.confirm(
      "Reset all banner slides to the original factory default?"
    );
    if (!isConfirmed) return;

    const defaults = resetBanners();
    setBanners(defaults);
    setEditingBanner(null);
    showNotify("Banner slides have been reset to original default.");
  };

  // -------------------------------------------------------------
  // 6. HANDLE IMAGE FILE UPLOAD
  // -------------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFileAsBase64(
      file,
      (base64String) => {
        setEditingBanner((prev) => ({ ...prev, image: base64String }));
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
            <ViewCarouselOutlinedIcon className="text-primary" />
            Homepage Hero Banner Slides
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the slides shown on the live homepage hero slider. Add, edit, or delete slides anytime.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetBanners}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RestartAltOutlinedIcon style={{ fontSize: 18 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={openNewBannerModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Banner Slide</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Slides List, Right is Live Preview Simulator */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: List of Slides */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Current Slides ({banners.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Click a slide to preview or edit
            </span>
          </div>

          {banners.map((slide, index) => {
            const isSelected = activeBannerIndex === index;
            const slideImg =
              slide.image || (index === 1 ? homeBg1Default : homeBannerDefault);

            return (
              <div
                key={slide.id || index}
                onClick={() => setActiveBannerIndex(index)}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20"
                    : "border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
                    <img
                      src={slideImg}
                      alt="Slide preview"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 rounded-md bg-slate-900/70 px-1.5 py-0.2 text-[9px] font-bold text-white backdrop-blur-xs">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary-dark">
                        {slide.smallHeading || "Badge"}
                      </span>
                      {slide.singleLine && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                          Compact Line
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 truncate text-sm font-bold text-slate-900">
                      {slide.headingLine1}{" "}
                      <span className="text-primary font-extrabold">
                        {slide.headingHighlight}
                      </span>
                    </h4>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {slide.description}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditBannerModal(slide);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                  >
                    <EditNoteOutlinedIcon style={{ fontSize: 16 }} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={banners.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBanner(slide.id);
                    }}
                    title={
                      banners.length <= 1
                        ? "At least one slide must remain"
                        : "Delete slide"
                    }
                    className="rounded-xl border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Preview Simulator */}
        <div className="lg:col-span-6">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VisibilityOutlinedIcon
                  className="text-primary"
                  style={{ fontSize: 20 }}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Hero Banner Simulator (Slide #{activeBannerIndex + 1})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditBannerModal(previewBanner)}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <EditNoteOutlinedIcon style={{ fontSize: 16 }} />
                <span>Edit Selected Slide</span>
              </button>
            </div>

            {/* Simulated Banner Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-xl min-h-[360px] flex items-center">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-40"
                style={{ backgroundImage: `url(${currentBannerImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 max-w-lg">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-md">
                  <ShieldOutlinedIcon
                    className="text-primary"
                    style={{ fontSize: 15 }}
                  />
                  <span>
                    {previewBanner.smallHeading || "Trusted Healthcare Services"}
                  </span>
                </div>

                {/* Heading */}
                <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl text-white">
                  {previewBanner.headingLine1 || "Quality Equipment."}
                  {previewBanner.singleLine ? " " : <br />}
                  <span className="bg-gradient-to-r from-primary to-sky-300 bg-clip-text text-transparent">
                    {previewBanner.headingHighlight || "Better Healthcare."}
                  </span>
                </h2>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-3">
                  {previewBanner.description ||
                    "Reinforce Healthcare Services delivers quality equipment..."}
                </p>

                {/* Feature tags */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1.5 backdrop-blur-xs">
                    <ShieldOutlinedIcon
                      className="text-primary shrink-0"
                      style={{ fontSize: 13 }}
                    />
                    <span className="truncate">Specialized</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1.5 backdrop-blur-xs">
                    <CategoryOutlinedIcon
                      className="text-primary shrink-0"
                      style={{ fontSize: 13 }}
                    />
                    <span className="truncate">Multi Specialties</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1.5 backdrop-blur-xs">
                    <LocalHospitalOutlinedIcon
                      className="text-primary shrink-0"
                      style={{ fontSize: 13 }}
                    />
                    <span className="truncate">Quality Products</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1.5 backdrop-blur-xs">
                    <LocalHospitalOutlinedIcon
                      className="text-primary shrink-0"
                      style={{ fontSize: 13 }}
                    />
                    <span className="truncate">Expert Support</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-3.5 py-2 text-xs font-bold text-white shadow-md">
                    {previewBanner.primaryBtnText || "Book an Appointment"}
                    <ArrowForwardIcon style={{ fontSize: 14 }} />
                  </span>
                  <span className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm">
                    {previewBanner.secondaryBtnText || "Explore Products"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-500 shadow-2xs">
              <p className="font-bold text-slate-700">⚡ Instant Synchronization</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                When you save a banner, changes are stored in browser localStorage and immediately broadcast to the live homepage without reloading.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT BANNER SLIDE                            */}
      {/* ========================================================= */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingBanner.id === "new"
                    ? "Add New Homepage Banner Slide"
                    : "Edit Banner Slide"}
                </h3>
                <p className="text-xs text-slate-500">
                  Changes will immediately sync to the homepage hero carousel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBanner(null);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="mt-6 space-y-5">
              {/* Badge & Headings */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Small Heading Badge
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.smallHeading || ""}
                  onChange={(e) =>
                    setEditingBanner((prev) => ({
                      ...prev,
                      smallHeading: e.target.value,
                    }))
                  }
                  placeholder="e.g. Trusted Healthcare Services"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Main Heading (Line 1)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBanner.headingLine1 || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        headingLine1: e.target.value,
                      }))
                    }
                    placeholder="e.g. Quality Equipment."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Highlighted Heading (Gradient)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBanner.headingHighlight || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        headingHighlight: e.target.value,
                      }))
                    }
                    placeholder="e.g. Better Healthcare."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Single line toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="singleLine"
                  checked={Boolean(editingBanner.singleLine)}
                  onChange={(e) =>
                    setEditingBanner((prev) => ({
                      ...prev,
                      singleLine: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded-md border-slate-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="singleLine"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Display title on a single line instead of breaking into two lines
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hero Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingBanner.description || ""}
                  onChange={(e) =>
                    setEditingBanner((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter descriptive text..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Buttons info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Primary Button Label & Link
                  </label>
                  <input
                    type="text"
                    value={editingBanner.primaryBtnText || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        primaryBtnText: e.target.value,
                      }))
                    }
                    placeholder="Book an Appointment"
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 mb-2"
                  />
                  <input
                    type="text"
                    value={editingBanner.primaryBtnLink || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        primaryBtnLink: e.target.value,
                      }))
                    }
                    placeholder="/contact"
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Secondary Button Label & Link
                  </label>
                  <input
                    type="text"
                    value={editingBanner.secondaryBtnText || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        secondaryBtnText: e.target.value,
                      }))
                    }
                    placeholder="Explore Products"
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 mb-2"
                  />
                  <input
                    type="text"
                    value={editingBanner.secondaryBtnLink || ""}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        secondaryBtnLink: e.target.value,
                      }))
                    }
                    placeholder="/machine"
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Banner Background Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={editingBanner.image || homeBannerDefault}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition">
                      <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                      <span>Upload New Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {editingBanner.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingBanner((prev) => ({ ...prev, image: "" }))
                        }
                        className="block text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Reset to default photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
                >
                  Save Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannersTab;
