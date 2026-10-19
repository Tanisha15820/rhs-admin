import { useState, useRef } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";

// Storage and utility functions
import {
  getMachineProducts,
  addMachineProduct,
  updateMachineProduct,
  deleteMachineProduct,
  resetMachineProducts,
  THEME_PRESETS,
} from "../../utils/machineStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

// Preset medical machine photos
import bipolarImg from "../../assets/images/bipolar_plasma_generator.png";
import diodeImg from "../../assets/images/diode_laser.png";
import cyberImg from "../../assets/images/cyber_blade.png";
import bladderImg from "../../assets/images/bladder_scanner.png";
import ursImg from "../../assets/images/flexible_video_urs.png";
import endoImg from "../../assets/images/endo_vision_set.png";

// Built-in presets list
const PRESET_PRODUCTS = [
  { key: "bipolar_plasma_generator", name: "Bipolar Plasma Generator", img: bipolarImg },
  { key: "diode_laser", name: "Diode Laser", img: diodeImg },
  { key: "cyber_blade", name: "CyberBlade", img: cyberImg },
  { key: "bladder_scanner", name: "Bladder Scanner", img: bladderImg },
  { key: "flexible_video_urs", name: "Flexible Video URS", img: ursImg },
  { key: "endo_vision_set", name: "Endo Vision Set", img: endoImg },
];

/**
 * MachinesTab Component
 * Simple, beginner-friendly component to manage healthcare equipment & machinery.
 * Supports: Adding, Editing, Deleting, and Resetting machine catalog cards.
 */
function MachinesTab({ products, setProducts, showNotify }) {
  // Modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input reference for photo upload
  const fileInputRef = useRef(null);

  // Helper to determine the photo to display (uploaded Base64 vs preset image)
  const getProductDisplayImage = (prod) => {
    if (!prod) return bipolarImg;
    if (prod.image) return prod.image;
    const foundPreset = PRESET_PRODUCTS.find((p) => p.key === prod.presetImageKey);
    return foundPreset ? foundPreset.img : bipolarImg;
  };

  // -------------------------------------------------------------
  // 1. OPEN MODAL FOR NEW PRODUCT
  // -------------------------------------------------------------
  const openNewProductModal = () => {
    setEditingProduct({
      id: "new",
      name: "Precision Surgical Laser",
      category: "Laser Surgery",
      image: "",
      presetImageKey: "diode_laser",
      themeId: "teal",
      description:
        "State-of-the-art medical laser technology for operating theaters and specialized clinics.",
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR EDITING
  // -------------------------------------------------------------
  const openEditProductModal = (prod) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. SAVE PRODUCT (ADD OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id === "new") {
      const updatedList = addMachineProduct(editingProduct);
      setProducts(updatedList);
      showNotify("New medical machine product added to catalog!");
    } else {
      const updatedList = updateMachineProduct(editingProduct.id, editingProduct);
      setProducts(updatedList);
      showNotify("Medical machine product updated!");
    }

    // Close modal
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // -------------------------------------------------------------
  // 4. DELETE PRODUCT
  // -------------------------------------------------------------
  const handleDeleteProduct = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this medical machine?"
    );
    if (!isConfirmed) return;

    const result = deleteMachineProduct(id);
    if (result.success) {
      setProducts(result.products);
      if (editingProduct?.id === id) setEditingProduct(null);
      showNotify("Machine product deleted from catalog.");
    } else {
      showNotify(result.message, "error");
    }
  };

  // -------------------------------------------------------------
  // 5. RESET PRODUCTS TO DEFAULTS
  // -------------------------------------------------------------
  const handleResetProducts = () => {
    const isConfirmed = window.confirm(
      "Reset medical machines to factory default list?"
    );
    if (!isConfirmed) return;

    const defaults = resetMachineProducts();
    setProducts(defaults);
    setEditingProduct(null);
    showNotify("Machine catalog reset to original defaults.");
  };

  // -------------------------------------------------------------
  // 6. UPLOAD IMAGE FROM COMPUTER
  // -------------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFileAsBase64(
      file,
      (base64String) => {
        setEditingProduct((prev) => ({
          ...prev,
          image: base64String,
          presetImageKey: "",
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
            <Inventory2OutlinedIcon className="text-primary" />
            Medical Machine Products & Content ({products.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the medical machinery cards and images displayed in the Healthcare Products carousel on the Homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetProducts}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RestartAltOutlinedIcon style={{ fontSize: 18 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={openNewProductModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Medical Machine</span>
          </button>
        </div>
      </div>

      {/* Machine Products Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((prod) => {
          const displayImg = getProductDisplayImage(prod);

          return (
            <div
              key={prod.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-lg hover:border-primary/40 transition-all duration-300"
            >
              {/* Category Badge & Action Buttons */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary-dark">
                  {prod.category || "Medical Equipment"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditProductModal(prod)}
                    className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition cursor-pointer"
                    title="Edit Machine"
                  >
                    <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                  <button
                    type="button"
                    disabled={products.length <= 1}
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Delete Machine"
                  >
                    <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {/* Product Photo Box */}
              <div
                className={`mt-4 flex h-44 w-full items-center justify-center rounded-2xl ${
                  prod.bg || "bg-sky-50/50"
                } p-3 relative overflow-hidden`}
              >
                <div
                  className={`absolute h-32 w-32 rounded-full ${
                    prod.iconBg || "bg-sky-100"
                  } opacity-60 blur-xs`}
                />
                <img
                  src={displayImg}
                  alt={prod.name}
                  className="relative z-10 max-h-36 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Title & Description */}
              <div className="mt-4">
                <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                  {prod.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {prod.description ||
                    "High-precision medical machinery designed for clinical efficiency."}
                </p>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Live in Homepage Carousel</span>
                <span className="font-semibold text-emerald-600">● Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MEDICAL MACHINE PRODUCT                 */}
      {/* ========================================================= */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct.id === "new"
                    ? "Add Medical Machine to Catalog"
                    : "Edit Medical Machine"}
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed in the Healthcare Products carousel on the Homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
              {/* Machine Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Machine Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Diode Laser"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.category || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g. Urology, Surgical, Laser"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brief Technical Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter medical equipment details..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Color Theme Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Color Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = editingProduct.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            themeId: preset.id,
                          }))
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary-dark ring-2 ring-primary/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full shadow-xs"
                          style={{ backgroundColor: preset.badgeBg }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Selection: Custom Upload or Preset */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Machine Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center">
                    <img
                      src={getProductDisplayImage(editingProduct)}
                      alt="Product Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition">
                      <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                      <span>Upload Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Or pick a built-in medical preset below:
                    </p>
                  </div>
                </div>

                {/* Presets Picker */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {PRESET_PRODUCTS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          presetImageKey: preset.key,
                          image: "",
                        }))
                      }
                      className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[10px] font-semibold transition cursor-pointer ${
                        editingProduct.presetImageKey === preset.key &&
                        !editingProduct.image
                          ? "border-primary bg-primary/10 text-primary-dark"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <img
                        src={preset.img}
                        alt={preset.name}
                        className="h-5 w-5 object-contain"
                      />
                      <span className="truncate">{preset.name}</span>
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
                    setEditingProduct(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
                >
                  Save Medical Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MachinesTab;
