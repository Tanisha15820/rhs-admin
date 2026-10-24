import { useState, useEffect, useRef, useCallback } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import {
  fetchProducts,
  fetchProductById,
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { THEME_PRESETS, getThemeStyles } from "../../utils/machineStorage";

/**
 * MachinesTab Component
 * Integrates with backend product APIs for Healthcare Products CRUD:
 * - GET /api/products?status=all/active/inactive
 * - GET /api/products/:id
 * - POST /api/products/upload-image
 * - POST /api/products
 * - PUT /api/products/:id
 * - DELETE /api/products/:id
 */
function MachinesTab({ showNotify, onProductsChanged }) {
  // Product list state
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Image upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // 1. LOAD PRODUCTS FROM BACKEND API
  // -------------------------------------------------------------
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchProducts("all");
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setFetchError(
        err.message || "Failed to load healthcare products from server."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Notify parent/sidebar of product changes
  const notifyChange = () => {
    if (onProductsChanged) {
      onProductsChanged();
    }
    window.dispatchEvent(new CustomEvent("rhs_products_updated"));
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR NEW PRODUCT
  // -------------------------------------------------------------
  const openNewProductModal = () => {
    setFormError("");
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingProduct({
      id: "new",
      name: "",
      is_active: true,
      color_palette: "medical-teal",
      image_url: "",
      cloudinary_public_id: "",
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. OPEN MODAL FOR EDITING (fetches details via GET /api/products/:id)
  // -------------------------------------------------------------
  const openEditProductModal = async (prod) => {
    setFormError("");
    setSelectedFile(null);
    setPreviewUrl(prod.image_url || "");
    setIsModalOpen(true);
    setIsFetchingDetail(true);

    try {
      // Fetch fresh details from backend API
      const detail = await fetchProductById(prod.id);
      setEditingProduct({
        id: detail.id,
        name: detail.name || "",
        is_active: Boolean(detail.is_active),
        color_palette: detail.color_palette || "rhs-sky-blue",
        image_url: detail.image_url || "",
        cloudinary_public_id: detail.cloudinary_public_id || "",
      });
      setPreviewUrl(detail.image_url || "");
    } catch (err) {
      console.warn("Failed to fetch single product by id, using card data:", err);
      setEditingProduct({
        id: prod.id,
        name: prod.name || "",
        is_active: Boolean(prod.is_active),
        color_palette: prod.color_palette || "rhs-sky-blue",
        image_url: prod.image_url || "",
        cloudinary_public_id: prod.cloudinary_public_id || "",
      });
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // -------------------------------------------------------------
  // 4. FILE INPUT CHANGE (Preview image before upload)
  // -------------------------------------------------------------
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image file size must be less than 5MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFormError("Only JPEG, PNG and WebP images are allowed.");
      return;
    }

    setFormError("");
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // -------------------------------------------------------------
  // 5. SAVE PRODUCT (ADD OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const trimmedName = (editingProduct.name || "").trim();
    if (!trimmedName) {
      setFormError("Please enter a product name.");
      return;
    }

    // Check image for new product
    if (editingProduct.id === "new" && !selectedFile) {
      setFormError("Please select an image for the new product.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      let finalImageUrl = editingProduct.image_url;
      let finalPublicId = editingProduct.cloudinary_public_id;

      // Step 1: Upload image to Cloudinary if a new file was selected
      if (selectedFile) {
        const uploadResult = await uploadProductImage(selectedFile);
        finalImageUrl = uploadResult.image_url;
        finalPublicId = uploadResult.cloudinary_public_id;
      }

      if (!finalImageUrl || !finalPublicId) {
        throw new Error("Product image is required.");
      }

      // Step 2: Create or update product via backend API
      if (editingProduct.id === "new") {
        await createProduct({
          name: trimmedName,
          color_palette: editingProduct.color_palette,
          image_url: finalImageUrl,
          cloudinary_public_id: finalPublicId,
          is_active: editingProduct.is_active,
        });
        showNotify?.("New healthcare product added successfully!");
      } else {
        await updateProduct(editingProduct.id, {
          name: trimmedName,
          color_palette: editingProduct.color_palette,
          image_url: finalImageUrl,
          cloudinary_public_id: finalPublicId,
          is_active: editingProduct.is_active,
        });
        showNotify?.("Healthcare product updated successfully!");
      }

      // Close modal and refresh list
      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedFile(null);
      setPreviewUrl("");
      await loadProducts();
      notifyChange();
    } catch (err) {
      console.error("Save product error:", err);
      setFormError(err.message || "Failed to save healthcare product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 6. DELETE PRODUCT
  // -------------------------------------------------------------
  const handleDeleteProduct = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this healthcare product?"
    );
    if (!isConfirmed) return;

    try {
      await deleteProduct(id);
      showNotify?.("Healthcare product deleted from catalog.");
      await loadProducts();
      notifyChange();
    } catch (err) {
      console.error("Delete product error:", err);
      showNotify?.(err.message || "Failed to delete product.", "error");
    }
  };

  // -------------------------------------------------------------
  // 7. TOGGLE PRODUCT STATUS (PUT /api/products/:id with updated is_active)
  // -------------------------------------------------------------
  const handleToggleStatus = async (prod) => {
    const nextStatus = !Boolean(prod.is_active);
    try {
      await updateProduct(prod.id, {
        name: prod.name,
        color_palette: prod.color_palette,
        image_url: prod.image_url,
        cloudinary_public_id: prod.cloudinary_public_id,
        is_active: nextStatus,
      });
      showNotify?.(
        `Product marked as ${nextStatus ? "Active" : "Inactive"}.`
      );
      await loadProducts();
      notifyChange();
    } catch (err) {
      console.error("Toggle status error:", err);
      showNotify?.(err.message || "Failed to update product status.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Inventory2OutlinedIcon className="text-primary" />
            Healthcare Products ({products.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the healthcare products and images displayed in the catalog on the Homepage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNewProductModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Healthcare Product</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200/80 bg-white">
          <CircularProgress size={36} className="text-primary" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading healthcare products from server...
          </p>
        </div>
      )}

      {/* Fetch error state */}
      {!isLoading && fetchError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-center">
          <p className="text-sm font-bold text-rose-800">
            Unable to connect to product server
          </p>
          <p className="mt-1 text-xs text-rose-600">{fetchError}</p>
          <button
            type="button"
            onClick={() => loadProducts()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !fetchError && products.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Inventory2OutlinedIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No healthcare products found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            No products exist in the catalog yet. Click Add Healthcare Product to create one.
          </p>
          <button
            type="button"
            onClick={openNewProductModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 16 }} />
            <span>Add First Product</span>
          </button>
        </div>
      )}

      {/* Product Cards Grid */}
      {!isLoading && !fetchError && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => {
            const theme = getThemeStyles(prod.color_palette);
            const isActive = Boolean(prod.is_active);

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                {/* Card Top: Status Badge & Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(prod)}
                    title={`Click to set as ${isActive ? "Inactive" : "Active"}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200/60 hover:bg-slate-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditProductModal(prod)}
                      className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition cursor-pointer"
                      title="Edit Product"
                    >
                      <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Product"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Product Photo Box */}
                <div
                  className={`mt-4 flex h-44 w-full items-center justify-center rounded-2xl ${
                    theme.bg || "bg-sky-50/50"
                  } p-3 relative overflow-hidden`}
                >
                  <div
                    className={`absolute h-32 w-32 rounded-full ${
                      theme.iconBg || "bg-sky-100"
                    } opacity-60 blur-xs`}
                  />
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="relative z-10 max-h-36 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center text-slate-400">
                      <Inventory2OutlinedIcon style={{ fontSize: 40 }} />
                      <span className="text-[11px] mt-1">No Image</span>
                    </div>
                  )}
                </div>

                {/* Title Only */}
                <div className="mt-4">
                  <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                    {prod.name}
                  </h4>
                </div>

                {/* Footer Indicator */}
                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">
                    {theme.label || prod.color_palette}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    ● {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT HEALTHCARE PRODUCT                      */}
      {/* ========================================================= */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct.id === "new"
                    ? "Add Healthcare Product"
                    : "Edit Healthcare Product"}
                </h3>
                <p className="text-xs text-slate-500">
                  Connected to backend database & Cloudinary storage.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Loading indicator when fetching product details */}
            {isFetchingDetail && (
              <div className="flex items-center justify-center py-12">
                <CircularProgress size={28} className="text-primary" />
                <span className="ml-3 text-xs text-slate-500 font-medium">
                  Loading product details...
                </span>
              </div>
            )}

            {!isFetchingDetail && (
              <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
                {formError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    {formError}
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Name *
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

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingProduct.is_active ? "Active" : "Inactive"}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
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

                {/* Color Theme Palette */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Card Color Palette
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected =
                        editingProduct.color_palette === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev) => ({
                              ...prev,
                              color_palette: preset.id,
                            }))
                          }
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary-dark ring-2 ring-primary/20"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full shadow-xs shrink-0"
                            style={{ backgroundColor: preset.badgeBg }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image Selection & Upload */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Product Photo *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Product Preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Inventory2OutlinedIcon className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition">
                        <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                        <span>
                          {selectedFile || editingProduct.image_url
                            ? "Change Photo"
                            : "Upload Photo"}
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        {selectedFile
                          ? `Selected: ${selectedFile.name}`
                          : "JPEG, PNG, or WebP up to 5MB (stored on Cloudinary)."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <CircularProgress size={14} color="inherit" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Saving..."
                        : editingProduct.id === "new"
                        ? "Create Product"
                        : "Save Changes"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MachinesTab;
