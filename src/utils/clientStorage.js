export const CLIENTS_STORAGE_KEY = "rhs_clients_v1";

export const CLIENT_ACCENT_OPTIONS = [
  { id: "blue", label: "Soft Blue", bgClass: "bg-[#F3F7FF]", previewHex: "#F3F7FF" },
  { id: "sky", label: "Sky Tint", bgClass: "bg-[#F0FAFF]", previewHex: "#F0FAFF" },
  { id: "mint", label: "Mint Tint", bgClass: "bg-[#F0FBF6]", previewHex: "#F0FBF6" },
  { id: "lavender", label: "Lavender Tint", bgClass: "bg-[#F7F4FF]", previewHex: "#F7F4FF" },
  { id: "ice", label: "Ice Blue", bgClass: "bg-[#F0F8FF]", previewHex: "#F0F8FF" },
  { id: "seafoam", label: "Seafoam", bgClass: "bg-[#F0FBFA]", previewHex: "#F0FBFA" },
  { id: "peach", label: "Warm Peach", bgClass: "bg-[#FFF7F2]", previewHex: "#FFF7F2" },
  { id: "white", label: "Pure White", bgClass: "bg-white", previewHex: "#FFFFFF" },
];

export const DEFAULT_CLIENTS = [
  {
    id: "client-1",
    name: "MAX Hospital",
    subtitle: "HOSPITALS",
    description: "Advanced medical care with patient-first excellence.",
    accent: "bg-[#F3F7FF]",
    presetKey: "max",
    logo: "",
  },
  {
    id: "client-2",
    name: "Fortis Healthcare",
    subtitle: "HOSPITALS",
    description: "Specialized tertiary healthcare and surgical centers.",
    accent: "bg-[#F0FAFF]",
    presetKey: "fortis",
    logo: "",
  },
  {
    id: "client-3",
    name: "Siemens Healthineers",
    subtitle: "PARTNERS",
    description: "Innovative imaging and diagnostic clinical technology.",
    accent: "bg-[#F0FBF6]",
    presetKey: "siemens",
    logo: "",
  },
  {
    id: "client-4",
    name: "MAX Healthcare Group",
    subtitle: "HOSPITALS",
    description: "Multi-specialty healthcare and robotic surgical facilities.",
    accent: "bg-[#F7F4FF]",
    presetKey: "max",
    logo: "",
  },
  {
    id: "client-5",
    name: "Siemens Medical Systems",
    subtitle: "DIAGNOSTICS",
    description: "Next-generation healthcare engineering and precision instruments.",
    accent: "bg-[#F0F8FF]",
    presetKey: "siemens",
    logo: "",
  },
  {
    id: "client-6",
    name: "Fortis Memorial Research",
    subtitle: "RESEARCH",
    description: "Leading medical innovation and patient-centered clinical care.",
    accent: "bg-[#F0FBFA]",
    presetKey: "fortis",
    logo: "",
  },
];

export const getAllClients = () => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_CLIENTS;
  } catch (error) {
    console.error("Failed to read clients from localStorage:", error);
    return DEFAULT_CLIENTS;
  }
};

export const saveAllClients = (clients) => {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    window.dispatchEvent(
      new CustomEvent("rhs_clients_updated", { detail: clients })
    );
    return true;
  } catch (error) {
    console.error("Failed to save clients to localStorage:", error);
    return false;
  }
};

export const addClient = (item) => {
  const current = getAllClients();
  const newItem = {
    id: `client-${Date.now()}`,
    name: item.name?.trim() || "Healthcare Partner",
    subtitle: item.subtitle?.trim() || "CLIENT",
    description: item.description?.trim() || "Trusted partner in healthcare solutions.",
    accent: item.accent || "bg-[#F3F7FF]",
    presetKey: item.presetKey || "max",
    logo: item.logo || "",
  };
  const updated = [...current, newItem];
  saveAllClients(updated);
  return updated;
};

export const updateClient = (id, updatedFields) => {
  const current = getAllClients();
  const updated = current.map((item) =>
    item.id === id ? { ...item, ...updatedFields } : item
  );
  saveAllClients(updated);
  return updated;
};

export const deleteClient = (id) => {
  const current = getAllClients();
  if (current.length <= 1) {
    return {
      success: false,
      message: "At least one client card must remain on the homepage.",
      clients: current,
    };
  }
  const updated = current.filter((item) => item.id !== id);
  saveAllClients(updated);
  return {
    success: true,
    clients: updated,
  };
};

export const resetClients = () => {
  try {
    localStorage.removeItem(CLIENTS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("rhs_clients_updated", { detail: DEFAULT_CLIENTS })
    );
    return DEFAULT_CLIENTS;
  } catch (error) {
    console.error("Failed to reset clients:", error);
    return DEFAULT_CLIENTS;
  }
};