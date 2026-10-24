/**
 * Product Theme Presets & Color Palette Styling
 * Backend is the single source of truth for all product records.
 * Hardcoded product records and localStorage persistence have been completely removed.
 */

export const THEME_PRESETS = [
  {
    id: "royal-purple",
    label: "Royal Purple",
    bg: "bg-[#F1EDFF]",
    iconBg: "bg-[#E4DAFF]",
    iconColor: "text-[#7357E8]",
    lineColor: "bg-[#7357E8]",
    badgeBg: "#7357E8",
  },
  {
    id: "medical-teal",
    label: "Medical Teal",
    bg: "bg-[#EDF9F7]",
    iconBg: "bg-[#D5F2EC]",
    iconColor: "text-[#1EAE9B]",
    lineColor: "bg-[#1EAE9B]",
    badgeBg: "#1EAE9B",
  },
  {
    id: "rhs-sky-blue",
    label: "RHS Sky Blue",
    bg: "bg-[#EEF5FF]",
    iconBg: "bg-[#D9E8FF]",
    iconColor: "text-[#4285E8]",
    lineColor: "bg-[#4285E8]",
    badgeBg: "#4285E8",
  },
  {
    id: "surgical-rose",
    label: "Surgical Rose",
    bg: "bg-[#FFF1F5]",
    iconBg: "bg-[#FFE0E9]",
    iconColor: "text-[#F15B91]",
    lineColor: "bg-[#F15B91]",
    badgeBg: "#F15B91",
  },
];

export const COLOR_PALETTES = {
  "royal-purple": THEME_PRESETS[0],
  "medical-teal": THEME_PRESETS[1],
  "rhs-sky-blue": THEME_PRESETS[2],
  "surgical-rose": THEME_PRESETS[3],
  // Backwards compatibility with legacy short aliases
  purple: THEME_PRESETS[0],
  teal: THEME_PRESETS[1],
  blue: THEME_PRESETS[2],
  pink: THEME_PRESETS[3],
};

export const normalizePalette = (palette) => {
  if (palette === "purple") return "royal-purple";
  if (palette === "teal") return "medical-teal";
  if (palette === "blue") return "rhs-sky-blue";
  if (palette === "pink") return "surgical-rose";
  if (
    ["royal-purple", "medical-teal", "rhs-sky-blue", "surgical-rose"].includes(
      palette
    )
  ) {
    return palette;
  }
  return "rhs-sky-blue";
};

export const getThemeStyles = (palette) => {
  const norm = normalizePalette(palette);
  return COLOR_PALETTES[norm] || THEME_PRESETS[2];
};

// Safeguard: Remove obsolete product localStorage persistence key
try {
  localStorage.removeItem("rhs_machine_products_v1");
} catch {}