import blogImg1 from "../assets/images/blog_3.png";
import blogImg2 from "../assets/images/blog_2.png";
import blogImg3 from "../assets/images/blog_1.png";
import blogImg4 from "../assets/images/blog_4.png";
import laserTechImg from "../assets/images/newsletter_laser_tech.jpg";
import roboticImg from "../assets/images/newsletter_robotic_surgery.jpg";

export const BLOGS_STORAGE_KEY = "rhs_blogs_v1";

export const BLOG_IMAGE_PRESETS = [
  { id: "blog_3", label: "Plasma / General Surgery (blog_3)", src: blogImg1 },
  { id: "blog_2", label: "Diode Laser (blog_2)", src: blogImg2 },
  { id: "blog_1", label: "Checklist / Procurement (blog_1)", src: blogImg3 },
  { id: "blog_4", label: "Turnaround / OT (blog_4)", src: blogImg4 },
  { id: "laser_tech", label: "Laser Tech / Dusting (laser_tech)", src: laserTechImg },
  { id: "robotic_surgery", label: "Robotic / Flexible URS (robotic)", src: roboticImg },
];

export const BLOG_PRESET_MAP = {
  blog_3: blogImg1,
  blog_2: blogImg2,
  blog_1: blogImg3,
  blog_4: blogImg4,
  laser_tech: laserTechImg,
  robotic_surgery: roboticImg,
};

/**
 * Resolve display image from backend thumbnail_url, uploaded image URL, or preset key
 */
export const getResolvedBlogImage = (blog) => {
  const img = blog?.thumbnail_url || blog?.image;
  if (img && typeof img === "string" && img.trim() !== "") {
    return img;
  }
  if (blog?.presetKey && BLOG_PRESET_MAP[blog.presetKey]) {
    return BLOG_PRESET_MAP[blog.presetKey];
  }
  return blogImg1;
};

/**
 * Remove obsolete legacy blog records from browser localStorage
 */
export const clearLegacyBlogsStorage = () => {
  try {
    localStorage.removeItem(BLOGS_STORAGE_KEY);
  } catch {
    // ignore storage access errors
  }
};