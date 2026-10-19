export const BANNER_SLIDES_KEY = "rhs_banner_slides_v2";

export const DEFAULT_BANNER_SLIDES = [
  {
    id: "slide-1",
    image: "",
    smallHeading: "Trusted Healthcare Services",
    headingLine1: "Quality Equipment.",
    headingHighlight: "Better Healthcare.",
    singleLine: false,
    description:
      "Reinforce Healthcare Services delivers quality medical equipment and innovative solutions designed to support healthcare professionals across multiple specialties.",
    primaryBtnText: "Book an Appointment",
    primaryBtnLink: "/contact",
    secondaryBtnText: "Explore Products",
    secondaryBtnLink: "/machine",
    isActive: true,
  },
  {
    id: "slide-2",
    image: "",
    smallHeading: "Trusted Healthcare Services",
    headingLine1: "LithoPulse",
    headingHighlight: "35W",
    singleLine: true,
    description: "Compact laser system for precise clinical performance",
    primaryBtnText: "Book an Appointment",
    primaryBtnLink: "/contact",
    secondaryBtnText: "Explore Products",
    secondaryBtnLink: "/machine",
    isActive: true,
  },
];

export const getAllBanners = () => {
  try {
    const raw = localStorage.getItem(BANNER_SLIDES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_BANNER_SLIDES;
  } catch (error) {
    console.error("Failed to read banner slides from localStorage:", error);
    return DEFAULT_BANNER_SLIDES;
  }
};

export const saveAllBanners = (slides) => {
  try {
    localStorage.setItem(BANNER_SLIDES_KEY, JSON.stringify(slides));
    window.dispatchEvent(
      new CustomEvent("rhs_banner_updated", { detail: slides })
    );
    return true;
  } catch (error) {
    console.error("Failed to save banner slides to localStorage:", error);
    return false;
  }
};

export const addBannerSlide = (newSlide) => {
  const current = getAllBanners();
  const slideToAdd = {
    id: `slide-${Date.now()}`,
    image: newSlide.image || "",
    smallHeading: newSlide.smallHeading || "Trusted Healthcare Services",
    headingLine1: newSlide.headingLine1 || "Advanced Medical Solutions",
    headingHighlight: newSlide.headingHighlight || "For Better Care",
    singleLine: Boolean(newSlide.singleLine),
    description:
      newSlide.description ||
      "Delivering world-class surgical and diagnostic equipment for healthcare professionals.",
    primaryBtnText: newSlide.primaryBtnText || "Book an Appointment",
    primaryBtnLink: newSlide.primaryBtnLink || "/contact",
    secondaryBtnText: newSlide.secondaryBtnText || "Explore Products",
    secondaryBtnLink: newSlide.secondaryBtnLink || "/machine",
    isActive: true,
  };
  const updated = [...current, slideToAdd];
  saveAllBanners(updated);
  return updated;
};

export const updateBannerSlide = (id, updatedFields) => {
  const current = getAllBanners();
  const updated = current.map((slide) =>
    slide.id === id ? { ...slide, ...updatedFields } : slide
  );
  saveAllBanners(updated);
  return updated;
};

export const deleteBannerSlide = (id) => {
  const current = getAllBanners();
  if (current.length <= 1) {
    return {
      success: false,
      message: "At least one banner slide must remain active on the homepage.",
      slides: current,
    };
  }
  const updated = current.filter((slide) => slide.id !== id);
  saveAllBanners(updated);
  return {
    success: true,
    slides: updated,
  };
};

export const resetBanners = () => {
  try {
    localStorage.removeItem(BANNER_SLIDES_KEY);
    window.dispatchEvent(
      new CustomEvent("rhs_banner_updated", { detail: DEFAULT_BANNER_SLIDES })
    );
    return DEFAULT_BANNER_SLIDES;
  } catch (error) {
    console.error("Failed to reset banner slides:", error);
    return DEFAULT_BANNER_SLIDES;
  }
};