/**
 * Client UI configuration and styling helpers for Admin Panel
 * Hardcoded client records and localStorage persistence have been completely removed.
 * Source of truth is now the Node.js/Express MySQL backend via clientService.
 */

export const CLIENTS_STORAGE_KEY = "rhs_clients_v1";

export const CLIENT_THEME_OPTIONS = [
  { id: "soft-blue", label: "Soft Blue", bgClass: "bg-[#F3F7FF]", previewHex: "#F3F7FF" },
  { id: "sky-tint", label: "Sky Tint", bgClass: "bg-[#F0FAFF]", previewHex: "#F0FAFF" },
  { id: "mint-tint", label: "Mint Tint", bgClass: "bg-[#F0FBF6]", previewHex: "#F0FBF6" },
  { id: "lavender-tint", label: "Lavender Tint", bgClass: "bg-[#F7F4FF]", previewHex: "#F7F4FF" },
  { id: "ice-blue", label: "Ice Blue", bgClass: "bg-[#F0F8FF]", previewHex: "#F0F8FF" },
  { id: "seafoam", label: "Seafoam", bgClass: "bg-[#F0FBFA]", previewHex: "#F0FBFA" },
  { id: "warm-peach", label: "Warm Peach", bgClass: "bg-[#FFF7F2]", previewHex: "#FFF7F2" },
  { id: "pure-white", label: "Pure White", bgClass: "bg-white", previewHex: "#FFFFFF" },
];

export const CLIENT_ACCENT_OPTIONS = CLIENT_THEME_OPTIONS;

/**
 * Map a backend bg_theme string ('soft-blue', 'sky-tint', etc.) to the corresponding Tailwind class
 */
export const getBgClassFromTheme = (themeId) => {
  const match = CLIENT_THEME_OPTIONS.find((opt) => opt.id === themeId);
  return match ? match.bgClass : "bg-[#F3F7FF]";
};

/**
 * Remove legacy mock clients saved in localStorage
 */
export const clearLegacyClientsStorage = () => {
  try {
    localStorage.removeItem(CLIENTS_STORAGE_KEY);
  } catch {
    // ignore
  }
};