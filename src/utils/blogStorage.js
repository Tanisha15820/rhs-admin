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

export const DEFAULT_BLOGS = [
  {
    id: "blog-1",
    tag: "Surgical Innovation",
    title: "The Rise of Bipolar Plasma Technology in Modern OTs",
    date: "12 Aug 2026",
    readTime: "5 min read",
    author: {
      name: "Dr. Arvind Mehta",
      role: "Sr. Laparoscopic Surgeon",
      initials: "AM",
    },
    excerpt:
      "How bipolar plasma generators are reducing thermal spread and improving precision across general surgery procedures, and what it means for hospitals upgrading their OT setups.",
    presetKey: "blog_3",
    image: "",
    featured: true,
    views: "2.4k",
  },
  {
    id: "blog-2",
    tag: "Product Guide",
    title: "Diode Laser vs Traditional Systems: What Surgeons Should Know",
    date: "28 Jul 2026",
    readTime: "6 min read",
    author: {
      name: "Dr. Priya Nair",
      role: "Head of Laser Endourology",
      initials: "PN",
    },
    excerpt:
      "A practical comparison of diode laser systems against conventional equipment, covering cost of ownership, safety margins, and day-to-day usability in the OT.",
    presetKey: "blog_2",
    image: "",
    views: "1.8k",
  },
  {
    id: "blog-3",
    tag: "Hospital Insights",
    title: "Building an Equipment Procurement Checklist for General Surgery",
    date: "10 Jul 2026",
    readTime: "4 min read",
    excerpt:
      "From compliance to after-sales support, here is a checklist hospital administrators can use before finalizing any surgical equipment vendor.",
    presetKey: "blog_1",
    image: "",
    views: "1.2k",
  },
  {
    id: "blog-4",
    tag: "Case Study",
    title: "Reducing OT Turnaround Time with Smarter Equipment Choices",
    date: "02 Jul 2026",
    readTime: "7 min read",
    author: {
      name: "Dr. Sandeep Kulkarni",
      role: "Clinical OT Director",
      initials: "SK",
    },
    excerpt:
      "A look at how one multi-speciality hospital cut average OT turnaround time by rethinking their general surgery instrument stack.",
    presetKey: "blog_4",
    image: "",
    views: "3.1k",
  },
  {
    id: "blog-5",
    tag: "Surgical Innovation",
    title: "Next-Gen Thulium Fiber Laser (TFL) vs Holmium in Lithotripsy",
    date: "18 Jun 2026",
    readTime: "8 min read",
    author: {
      name: "Dr. Vikram Sethi",
      role: "Consultant Endourologist",
      initials: "VS",
    },
    excerpt:
      "Exploring sub-millimeter dusting, ultra-low retropulsion, and fiber flexibility that make Thulium Fiber Laser systems a game changer for calculus fragmentation.",
    presetKey: "laser_tech",
    image: "",
    views: "2.9k",
  },
  {
    id: "blog-6",
    tag: "Product Guide",
    title: "Single-Use vs Reusable Flexible Video URS: Cost & Clinical Tradeoffs",
    date: "04 Jun 2026",
    readTime: "5 min read",
    author: {
      name: "Dr. Ananya Sen",
      role: "Urology Department Lead",
      initials: "AS",
    },
    excerpt:
      "Evaluating maintenance cycles, optical clarity breakdown, sterilization turnaround, and infection control to determine the ideal ureterorenoscope deployment.",
    presetKey: "robotic_surgery",
    image: "",
    views: "1.5k",
  },
];

export const getAllBlogs = () => {
  try {
    const raw = localStorage.getItem(BLOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_BLOGS;
  } catch (err) {
    console.warn("Failed reading blogs from localStorage, falling back to defaults:", err);
    return DEFAULT_BLOGS;
  }
};

export const saveAllBlogs = (blogs) => {
  try {
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
    window.dispatchEvent(
      new CustomEvent("rhs_blogs_updated", {
        detail: { blogs },
      })
    );
  } catch (err) {
    console.error("Failed saving blogs to localStorage:", err);
  }
};

export const addBlog = (blogData) => {
  const current = getAllBlogs();
  const authorName = blogData.author?.name || "Reinforce Clinical Team";
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RC";

  const newBlog = {
    id: `blog-${Date.now()}`,
    tag: blogData.tag?.trim() || "Article",
    title: blogData.title?.trim() || "Untitled Blog Post",
    date:
      blogData.date?.trim() ||
      new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    readTime: blogData.readTime?.trim() || "5 min read",
    excerpt: blogData.excerpt?.trim() || "",
    presetKey: blogData.presetKey || "blog_3",
    image: blogData.image || "",
    author: {
      name: authorName,
      role: blogData.author?.role || "Surgical Equipment Specialist",
      initials: blogData.author?.initials || initials,
    },
    featured: Boolean(blogData.featured),
    published: blogData.published !== false,
    views: blogData.views || "1.2k",
  };
  const updated = [newBlog, ...current];
  saveAllBlogs(updated);
  return updated;
};

export const updateBlog = (id, updatedFields) => {
  const current = getAllBlogs();
  const updated = current.map((blog) => {
    if (blog.id === id) {
      return {
        ...blog,
        ...updatedFields,
        author: updatedFields.author || blog.author || {
          name: "Reinforce Clinical Team",
          role: "Surgical Equipment Specialist",
          initials: "RC",
        },
      };
    }
    return blog;
  });
  saveAllBlogs(updated);
  return updated;
};

export const deleteBlog = (id) => {
  const current = getAllBlogs();
  const updated = current.filter((b) => b.id !== id);
  saveAllBlogs(updated);
  return updated;
};

export const resetBlogs = () => {
  saveAllBlogs(DEFAULT_BLOGS);
  return DEFAULT_BLOGS;
};