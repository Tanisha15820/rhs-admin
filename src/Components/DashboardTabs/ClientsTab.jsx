import { useState, useEffect, useRef, useCallback } from "react";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

// API service and storage helpers
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  uploadClientLogo,
} from "../../services/clientService";
import {
  CLIENT_THEME_OPTIONS,
  getBgClassFromTheme,
} from "../../utils/clientStorage";

/**
 * ClientsTab Component
 * Integrates with backend Clients APIs:
 * - GET /api/clients?status=all
 * - GET /api/clients/:id
 * - POST /api/clients/upload-image
 * - POST /api/clients
 * - PUT /api/clients/:id
 * - DELETE /api/clients/:id
 */
function ClientsTab({ showNotify, onClientsChanged }) {
  // Clients list state
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal and form states
  const [editingClient, setEditingClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formError, setFormError] = useState("");

  // Hidden file input reference for logo upload
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // 1. FETCH ALL CLIENTS (GET /api/clients?status=all)
  // -------------------------------------------------------------
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchClients("all");
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients from server:", err);
      setFetchError(
        err.message || "Failed to load clients from server. Please try again."
      );
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const notifyChange = () => {
    if (onClientsChanged) {
      onClientsChanged();
    }
    window.dispatchEvent(new CustomEvent("rhs_clients_updated"));
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR NEW CLIENT
  // -------------------------------------------------------------
  const openNewClientModal = () => {
    setFormError("");
    setEditingClient({
      id: "new",
      name: "",
      logo_url: null,
      cloudinary_public_id: null,
      bg_theme: "soft-blue",
      is_active: true,
      display_order: clients.length + 1,
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. OPEN MODAL FOR EDITING (GET /api/clients/:id)
  // -------------------------------------------------------------
  const openEditClientModal = async (client) => {
    setFormError("");
    // Preliminary populate from clicked card
    setEditingClient({
      id: client.id,
      name: client.name || "",
      logo_url: client.logo_url || null,
      cloudinary_public_id: client.cloudinary_public_id || null,
      bg_theme: client.bg_theme || "soft-blue",
      is_active: Boolean(client.is_active),
      display_order: Number.isInteger(client.display_order)
        ? client.display_order
        : 0,
    });
    setIsModalOpen(true);
    setIsFetchingDetail(true);

    try {
      // Fetch fresh, full record from backend
      const detail = await fetchClientById(client.id);
      if (detail) {
        setEditingClient({
          id: detail.id,
          name: detail.name || "",
          logo_url: detail.logo_url || null,
          cloudinary_public_id: detail.cloudinary_public_id || null,
          bg_theme: detail.bg_theme || "soft-blue",
          is_active: Boolean(detail.is_active),
          display_order: Number.isInteger(detail.display_order)
            ? detail.display_order
            : 0,
        });
      }
    } catch (err) {
      console.warn("Failed to fetch client by id, using card data:", err);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // -------------------------------------------------------------
  // 4. UPLOAD LOGO (POST /api/clients/upload-image)
  // -------------------------------------------------------------
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Logo file size must be less than 5MB.");
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
    setIsUploadingLogo(true);

    try {
      const uploadResult = await uploadClientLogo(file);
      setEditingClient((prev) => ({
        ...prev,
        logo_url: uploadResult.logo_url,
        cloudinary_public_id: uploadResult.cloudinary_public_id,
      }));
      showNotify?.("Client logo uploaded successfully!");
    } catch (err) {
      console.error("Client logo upload error:", err);
      setFormError(err.message || "Failed to upload client logo.");
      showNotify?.(err.message || "Failed to upload client logo.", "error");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------------------------------------
  // 5. SAVE CLIENT (POST /api/clients or PUT /api/clients/:id)
  // -------------------------------------------------------------
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!editingClient || isSubmitting || isUploadingLogo) return;

    const trimmedName = (editingClient.name || "").trim();
    if (!trimmedName) {
      setFormError("Please enter the client / partner name.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingClient.id === "new") {
        await createClient({
          name: trimmedName,
          logo_url: editingClient.logo_url || null,
          cloudinary_public_id: editingClient.cloudinary_public_id || null,
          bg_theme: editingClient.bg_theme || "soft-blue",
          is_active: Boolean(editingClient.is_active),
          display_order: parseInt(editingClient.display_order, 10) || 0,
        });
        showNotify?.("New client card added successfully!");
      } else {
        await updateClient(editingClient.id, {
          name: trimmedName,
          logo_url: editingClient.logo_url || null,
          cloudinary_public_id: editingClient.cloudinary_public_id || null,
          bg_theme: editingClient.bg_theme || "soft-blue",
          is_active: Boolean(editingClient.is_active),
          display_order: parseInt(editingClient.display_order, 10) || 0,
        });
        showNotify?.("Client card updated successfully!");
      }

      setIsModalOpen(false);
      setEditingClient(null);
      await loadClients();
      notifyChange();
    } catch (err) {
      console.error("Save client error:", err);
      setFormError(err.message || "Failed to save client card.");
      showNotify?.(err.message || "Failed to save client card.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 6. DELETE CLIENT (DELETE /api/clients/:id)
  // -------------------------------------------------------------
  const handleDeleteClient = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this client card?"
    );
    if (!isConfirmed) return;

    try {
      await deleteClient(id);
      showNotify?.("Client card deleted successfully.");
      await loadClients();
      notifyChange();
    } catch (err) {
      console.error("Delete client error:", err);
      showNotify?.(err.message || "Failed to delete client card.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GroupOutlinedIcon className="text-primary" />
            Clients
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the hospital & clinical partner logo cards displayed in the &quot;Trusted by Leading Healthcare Brands&quot; carousel on the Homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openNewClientModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Client Card</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200/80 bg-white">
          <CircularProgress size={36} className="text-primary" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading client cards from server...
          </p>
        </div>
      )}

      {/* Fetch error state */}
      {!isLoading && fetchError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-center">
          <p className="text-sm font-bold text-rose-800">
            Unable to connect to client server
          </p>
          <p className="mt-1 text-xs text-rose-600">{fetchError}</p>
          <button
            type="button"
            onClick={() => loadClients()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !fetchError && clients.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GroupOutlinedIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No client cards found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            No client cards exist yet. Click Add Client Card to create one.
          </p>
          <button
            type="button"
            onClick={openNewClientModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 16 }} />
            <span>Add First Client Card</span>
          </button>
        </div>
      )}

      {/* Client Cards Grid */}
      {!isLoading && !fetchError && clients.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {clients.map((client, index) => {
            const bgClass = getBgClassFromTheme(client.bg_theme);
            const clientInitial = (client.name || "C")
              .trim()
              .charAt(0)
              .toUpperCase();

            return (
              <div
                key={client.id || index}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                {/* Top Bar with Number & Controls */}
                <div className="flex items-center justify-between p-4 pb-2">
                  <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditClientModal(client)}
                      className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                      title="Edit Client Card"
                    >
                      <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Client Card"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Logo Presentation Area */}
                <div
                  className={`mx-4 my-2 flex h-40 items-center justify-center rounded-2xl border border-slate-100/90 p-4 transition duration-300 ${bgClass}`}
                >
                  {client.logo_url ? (
                    <img
                      src={client.logo_url}
                      alt={client.name || "Client"}
                      className="max-h-20 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 font-extrabold text-xl text-primary shadow-xs">
                      {clientInitial}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate flex-1">
                      {client.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">
                      Order: {client.display_order ?? 0}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Live on Homepage Carousel</span>
                    {client.is_active ? (
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CLIENT CARD                             */}
      {/* ========================================================= */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingClient.id === "new"
                    ? "Add New Client Card"
                    : "Edit Client Card"}
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed in the Trusted by Leading Healthcare Brands carousel on the Homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClient(null);
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

            <form onSubmit={handleSaveClient} className="mt-6 space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client / Hospital / Partner Name
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.name || ""}
                  onChange={(e) =>
                    setEditingClient((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. MAX Hospital"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={editingClient.is_active ? "Active" : "Inactive"}
                  onChange={(e) =>
                    setEditingClient((prev) => ({
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

              {/* Display Order */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingClient.display_order ?? 0}
                  onChange={(e) =>
                    setEditingClient((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Card Background Color Accent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Background Color Accent
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CLIENT_THEME_OPTIONS.map((opt) => {
                    const isSelected = editingClient.bg_theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditingClient((prev) => ({
                            ...prev,
                            bg_theme: opt.id,
                          }))
                        }
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold transition cursor-pointer ${isSelected
                            ? "border-primary bg-primary/10 text-primary-dark ring-2 ring-primary/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: opt.previewHex }}
                        />
                        <span className="truncate text-[10px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Logo Image */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Client Logo Image
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className={`h-20 w-32 shrink-0 rounded-xl border border-slate-200 p-2 flex items-center justify-center shadow-xs ${getBgClassFromTheme(
                      editingClient.bg_theme
                    )}`}
                  >
                    {editingClient.logo_url ? (
                      <img
                        src={editingClient.logo_url}
                        alt="Logo preview"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 font-bold text-base text-primary">
                        {(editingClient.name || "C")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition disabled:opacity-50">
                      {isUploadingLogo ? (
                        <>
                          <CircularProgress size={14} className="text-white" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                          <span>Upload Logo Image</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={isUploadingLogo}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload a custom logo image (JPEG, PNG, or WebP up to 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingLogo}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingLogo}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <CircularProgress size={14} className="text-white" />
                  )}
                  <span>Save Client Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsTab;
