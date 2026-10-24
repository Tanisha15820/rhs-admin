/**
 * Testimonial UI configuration and styling helpers
 * Hardcoded testimonial records and localStorage persistence have been completely removed.
 * Source of truth is now the Node.js/Express MySQL backend via testimonialService.
 */

export const TESTIMONIALS_STORAGE_KEY = "rhs_testimonials_v1";

export const TESTIMONIAL_BG_OPTIONS = [
  { id: "lavender", label: "Lavender", bgClass: "bg-[#EDE9FE]", previewHex: "#EDE9FE" },
  { id: "sky", label: "Sky Blue", bgClass: "bg-[#E0F2FE]", previewHex: "#E0F2FE" },
  { id: "rose", label: "Soft Rose", bgClass: "bg-[#FEE2E2]", previewHex: "#FEE2E2" },
  { id: "white", label: "Clean White", bgClass: "bg-white", previewHex: "#FFFFFF" },
  { id: "purple", label: "Soft Orchid", bgClass: "bg-[#FAE8FF]", previewHex: "#FAE8FF" },
  { id: "mint", label: "Mint Green", bgClass: "bg-[#E6F4EA]", previewHex: "#E6F4EA" },
];

/**
 * Map a backend bg_theme string ('lavender', 'sky', etc.) to the corresponding Tailwind class
 */
export const getBgClassFromTheme = (themeId) => {
  const match = TESTIMONIAL_BG_OPTIONS.find((opt) => opt.id === themeId);
  return match ? match.bgClass : "bg-[#EDE9FE]";
};

/**
 * Remove any legacy mock testimonials saved in localStorage
 */
export const clearLegacyTestimonialsStorage = () => {
  try {
    localStorage.removeItem(TESTIMONIALS_STORAGE_KEY);
  } catch {
    // ignore
  }
};