export const MACHINE_PRODUCTS_KEY = "rhs_machine_products_v1";

export const DEFAULT_MACHINE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Bipolar Plasma Generator",
    category: "Surgical",
    image: "",
    presetImageKey: "bipolar_plasma_generator",
    bg: "bg-[#F1EDFF]",
    iconBg: "bg-[#E4DAFF]",
    iconColor: "text-[#7357E8]",
    lineColor: "bg-[#7357E8]",
    description: "High-frequency plasma resection system for precise tissue coagulation.",
  },
  {
    id: "prod-2",
    name: "Diode Laser",
    category: "Laser Surgery",
    image: "",
    presetImageKey: "diode_laser",
    bg: "bg-[#EDF9F7]",
    iconBg: "bg-[#D5F2EC]",
    iconColor: "text-[#1EAE9B]",
    lineColor: "bg-[#1EAE9B]",
    description: "Dual-wavelength high power diode laser for multiple clinical procedures.",
  },
  {
    id: "prod-3",
    name: "CyberBlade",
    category: "Urology",
    image: "",
    presetImageKey: "cyber_blade",
    bg: "bg-[#EEF5FF]",
    iconBg: "bg-[#D9E8FF]",
    iconColor: "text-[#4285E8]",
    lineColor: "bg-[#4285E8]",
    description: "Ultra-sharp precision surgical instrumentation for minimally invasive work.",
  },
  {
    id: "prod-4",
    name: "Flexible Video URS",
    category: "Endoscopy",
    image: "",
    presetImageKey: "flexible_video_urs",
    bg: "bg-[#FFF1F5]",
    iconBg: "bg-[#FFE0E9]",
    iconColor: "text-[#F15B91]",
    lineColor: "bg-[#F15B91]",
    description: "High-resolution digital flexible ureteroscope for superior clinical visual clarity.",
  },
  {
    id: "prod-5",
    name: "Endo Vision Set",
    category: "OR Imaging",
    image: "",
    presetImageKey: "endo_vision_set",
    bg: "bg-[#F4F0FF]",
    iconBg: "bg-[#E6DDFF]",
    iconColor: "text-[#7357E8]",
    lineColor: "bg-[#7357E8]",
    description: "Complete laparoscopic and endoscopic camera tower & cold light system.",
  },
  {
    id: "prod-6",
    name: "Bladder Scanner",
    category: "Diagnostics",
    image: "",
    presetImageKey: "bladder_scanner",
    bg: "bg-[#EDF8FF]",
    iconBg: "bg-[#DCEEFF]",
    iconColor: "text-[#4285E8]",
    lineColor: "bg-[#4285E8]",
    description: "Non-invasive 3D ultrasound device for quick urinary volume assessment.",
  },
];

export const THEME_PRESETS = [
  {
    id: "purple",
    label: "Royal Purple",
    bg: "bg-[#F1EDFF]",
    iconBg: "bg-[#E4DAFF]",
    iconColor: "text-[#7357E8]",
    lineColor: "bg-[#7357E8]",
    badgeBg: "#7357E8",
  },
  {
    id: "teal",
    label: "Medical Teal",
    bg: "bg-[#EDF9F7]",
    iconBg: "bg-[#D5F2EC]",
    iconColor: "text-[#1EAE9B]",
    lineColor: "bg-[#1EAE9B]",
    badgeBg: "#1EAE9B",
  },
  {
    id: "blue",
    label: "RHS Sky Blue",
    bg: "bg-[#EEF5FF]",
    iconBg: "bg-[#D9E8FF]",
    iconColor: "text-[#4285E8]",
    lineColor: "bg-[#4285E8]",
    badgeBg: "#4285E8",
  },
  {
    id: "pink",
    label: "Surgical Rose",
    bg: "bg-[#FFF1F5]",
    iconBg: "bg-[#FFE0E9]",
    iconColor: "text-[#F15B91]",
    lineColor: "bg-[#F15B91]",
    badgeBg: "#F15B91",
  },
];

export const getMachineProducts = () => {
  try {
    const raw = localStorage.getItem(MACHINE_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_MACHINE_PRODUCTS;
  } catch (err) {
    console.error("Error loading machine products:", err);
    return DEFAULT_MACHINE_PRODUCTS;
  }
};

export const saveMachineProducts = (products) => {
  try {
    localStorage.setItem(MACHINE_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(
      new CustomEvent("rhs_machines_updated", {
        detail: { type: "products", data: products },
      })
    );
    return true;
  } catch (err) {
    console.error("Error saving machine products:", err);
    return false;
  }
};

export const addMachineProduct = (product) => {
  const current = getMachineProducts();
  const theme = THEME_PRESETS.find((t) => t.id === product.themeId) || THEME_PRESETS[2];
  const newProd = {
    id: `prod-${Date.now()}`,
    name: product.name || "New Medical Machine",
    category: product.category || "Healthcare Equipment",
    image: product.image || "",
    presetImageKey: product.presetImageKey || "",
    bg: theme.bg,
    iconBg: theme.iconBg,
    iconColor: theme.iconColor,
    lineColor: theme.lineColor,
    description: product.description || "High-precision medical machinery designed for clinical efficiency.",
  };
  const updated = [...current, newProd];
  saveMachineProducts(updated);
  return updated;
};

export const updateMachineProduct = (id, updatedFields) => {
  const current = getMachineProducts();
  let themeObj = {};
  if (updatedFields.themeId) {
    const found = THEME_PRESETS.find((t) => t.id === updatedFields.themeId);
    if (found) {
      themeObj = {
        bg: found.bg,
        iconBg: found.iconBg,
        iconColor: found.iconColor,
        lineColor: found.lineColor,
      };
    }
  }
  const updated = current.map((p) =>
    p.id === id ? { ...p, ...updatedFields, ...themeObj } : p
  );
  saveMachineProducts(updated);
  return updated;
};

export const deleteMachineProduct = (id) => {
  const current = getMachineProducts();
  if (current.length <= 1) {
    return {
      success: false,
      message: "At least one medical product must remain visible.",
      products: current,
    };
  }
  const updated = current.filter((p) => p.id !== id);
  saveMachineProducts(updated);
  return {
    success: true,
    products: updated,
  };
};

export const resetMachineProducts = () => {
  try {
    localStorage.removeItem(MACHINE_PRODUCTS_KEY);
    window.dispatchEvent(
      new CustomEvent("rhs_machines_updated", {
        detail: { type: "products", data: DEFAULT_MACHINE_PRODUCTS },
      })
    );
    return DEFAULT_MACHINE_PRODUCTS;
  } catch (err) {
    console.error("Error resetting machine products:", err);
    return DEFAULT_MACHINE_PRODUCTS;
  }
};