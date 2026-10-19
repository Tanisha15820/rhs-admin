import { useState, useRef } from "react";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";

// Storage helpers and preset colors
import {
  getAllClients,
  addClient,
  updateClient,
  deleteClient,
  resetClients,
  CLIENT_ACCENT_OPTIONS,
} from "../../utils/clientStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

// Preset hospital and partner logos
import maxLogo from "../../assets/images/max.png";
import fortisLogo from "../../assets/images/fortis.png";
import siemensLogo from "../../assets/images/siemens.png";

// Built-in presets map
const CLIENT_PRESETS = [
  { key: "max", name: "MAX Hospital", img: maxLogo },
  { key: "fortis", name: "Fortis Healthcare", img: fortisLogo },
  { key: "siemens", name: "Siemens Healthineers", img: siemensLogo },
];

/**
 * ClientsTab Component
 * Simple, beginner-friendly component to manage hospital and client partner cards.
 * Supports: Card listing, Logo upload, Adding, Editing, and Deleting.
 */
function ClientsTab({ clients, setClients, showNotify }) {
  // Modal states
  const [editingClient, setEditingClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hidden file input reference for logo upload
  const fileInputRef = useRef(null);

  // Helper to determine the client logo to render
  const getClientDisplayLogo = (client) => {
    if (!client) return maxLogo;
    if (client.logo) return client.logo;
    const found = CLIENT_PRESETS.find((p) => p.key === client.presetKey);
    return found ? found.img : maxLogo;
  };

  // -------------------------------------------------------------
  // 1. OPEN MODAL FOR NEW CLIENT
  // -------------------------------------------------------------
  const openNewClientModal = () => {
    setEditingClient({
      id: "new",
      name: "MAX Hospital",
      subtitle: "HOSPITALS",
      description: "Advanced medical care with patient-first excellence.",
      accent: "bg-[#F3F7FF]",
      presetKey: "max",
      logo: "",
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR EDITING
  // -------------------------------------------------------------
  const openEditClientModal = (client) => {
    setEditingClient({ ...client });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. SAVE CLIENT (ADD OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!editingClient) return;

    if (editingClient.id === "new") {
      const updatedList = addClient(editingClient);
      setClients(updatedList);
      showNotify("New client card added successfully!");
    } else {
      const updatedList = updateClient(editingClient.id, editingClient);
      setClients(updatedList);
      showNotify("Client card updated successfully!");
    }

    setIsModalOpen(false);
    setEditingClient(null);
  };

  // -------------------------------------------------------------
  // 4. DELETE CLIENT
  // -------------------------------------------------------------
  const handleDeleteClient = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this client card?"
    );
    if (!isConfirmed) return;

    const result = deleteClient(id);
    if (result.success) {
      setClients(result.clients);
      if (editingClient?.id === id) setEditingClient(null);
      showNotify("Client card deleted successfully.");
    } else {
      showNotify(result.message, "error");
    }
  };

  // -------------------------------------------------------------
  // 5. RESET CLIENTS TO DEFAULTS
  // -------------------------------------------------------------
  const handleResetClients = () => {
    const isConfirmed = window.confirm(
      "Reset all clients to factory default list?"
    );
    if (!isConfirmed) return;

    const defaults = resetClients();
    setClients(defaults);
    setEditingClient(null);
    showNotify("Clients catalog reset to original defaults.");
  };

  // -------------------------------------------------------------
  // 6. UPLOAD CLIENT LOGO IMAGE
  // -------------------------------------------------------------
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFileAsBase64(
      file,
      (base64String) => {
        setEditingClient((prev) => ({
          ...prev,
          logo: base64String,
          presetKey: "",
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
            <GroupOutlinedIcon className="text-primary" />
            Homepage Client Cards & Partner Logos ({clients.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the hospital & clinical partner logo cards displayed in the &quot;Trusted by Leading Healthcare Brands&quot; carousel on the Homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetClients}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RestartAltOutlinedIcon style={{ fontSize: 18 }} />
            <span>Reset Defaults</span>
          </button>
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

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {clients.map((client, index) => {
          const displayLogo = getClientDisplayLogo(client);

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
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary-dark">
                  {client.subtitle || "HOSPITAL"}
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
                    disabled={clients.length <= 1}
                    onClick={() => handleDeleteClient(client.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={
                      clients.length <= 1
                        ? "At least one client card must remain"
                        : "Delete Client Card"
                    }
                  >
                    <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {/* Logo Presentation Area */}
              <div
                className={`mx-4 my-2 flex h-40 items-center justify-center rounded-2xl border border-slate-100/90 p-4 transition duration-300 ${
                  client.accent || "bg-[#F3F7FF]"
                }`}
              >
                <img
                  src={displayLogo}
                  alt={client.name || "Client"}
                  className="max-h-20 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {client.name}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Live on Homepage Carousel</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category / Subtitle
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.subtitle || ""}
                  onChange={(e) =>
                    setEditingClient((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                  placeholder="e.g. HOSPITALS, PARTNERS, CLINIC"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Background Color Accent
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CLIENT_ACCENT_OPTIONS.map((opt) => {
                    const isSelected = editingClient.accent === opt.bgClass;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditingClient((prev) => ({
                            ...prev,
                            accent: opt.bgClass,
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
                        <span className="truncate text-[10px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo Selection: Upload or Preset */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Client Logo Image
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className={`h-20 w-32 shrink-0 rounded-xl border border-slate-200 p-2 flex items-center justify-center shadow-xs ${
                      editingClient.accent || "bg-[#F3F7FF]"
                    }`}
                  >
                    <img
                      src={getClientDisplayLogo(editingClient)}
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition">
                      <CloudUploadOutlinedIcon style={{ fontSize: 16 }} />
                      <span>Upload Logo Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Or select a built-in brand logo preset:
                    </p>
                  </div>
                </div>

                {/* Preset Brand Logos */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {CLIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() =>
                        setEditingClient((prev) => ({
                          ...prev,
                          presetKey: preset.key,
                          logo: "",
                        }))
                      }
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition cursor-pointer ${
                        editingClient.presetKey === preset.key &&
                        !editingClient.logo
                          ? "border-primary bg-primary/10 text-primary-dark ring-2 ring-primary/20"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <img
                        src={preset.img}
                        alt={preset.name}
                        className="h-6 w-12 object-contain"
                      />
                      <span className="truncate text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
                >
                  Save Client Card
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
