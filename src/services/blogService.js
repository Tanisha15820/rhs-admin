import axios from "axios";
import { getAuthToken } from "../utils/auth.js";
import {
  getAllBlogs,
  saveAllBlogs,
} from "../utils/blogStorage.js";

/**
 * Resolve the base API endpoint URL without duplicate /api prefixes
 */
const getBaseApiUrl = () => {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (!envUrl) return "/api";
  const clean = envUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${clean}/api`;
};

/**
 * Helper to get default authorization headers with the current admin JWT
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Track backend availability flag
let backendBlogApiAvailable = false;

/**
 * Check whether backend /api/blogs endpoint exists
 */
export const isBlogBackendAvailable = () => backendBlogApiAvailable;

/**
 * 1. Fetch all blogs (GET /api/blogs?status=all)
 * Falls back to in-memory blogs if backend endpoint is not yet implemented.
 */
export async function fetchBlogs(status = "all") {
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/blogs?status=${status}`, {
      headers: getAuthHeaders(),
    });
    backendBlogApiAvailable = true;
    return Array.isArray(response.data?.blogs) ? response.data.blogs : [];
  } catch (error) {
    // If backend returns 404 or connection error, fall back to in-memory state
    backendBlogApiAvailable = false;
    const memory = getAllBlogs();
    if (status === "active" || status === "published") {
      return memory.filter((b) => b.published !== false);
    }
    if (status === "inactive" || status === "draft") {
      return memory.filter((b) => b.published === false);
    }
    return memory;
  }
}

/**
 * 2. Fetch single blog by ID (GET /api/blogs/:id)
 */
export async function fetchBlogById(id) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/blogs/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.blog || null;
  } catch (error) {
    const memory = getAllBlogs();
    return memory.find((b) => String(b.id) === String(id)) || null;
  }
}

/**
 * 3. Create a new blog (POST /api/blogs)
 */
export async function createBlog(blogData) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.post(`${base}/blogs`, blogData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    backendBlogApiAvailable = true;
    return response.data?.blog;
  } catch (error) {
    // In-memory fallback
    const current = getAllBlogs();
    const authorName = blogData.author?.name || "Reinforce Clinical Team";
    const initials =
      blogData.author?.initials ||
      authorName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "RC";

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
      author: {
        name: authorName,
        role: blogData.author?.role || "Surgical Equipment Specialist",
        initials,
      },
      excerpt: blogData.excerpt?.trim() || "",
      presetKey: blogData.presetKey || "blog_3",
      image: blogData.image || "",
      featured: Boolean(blogData.featured),
      published: blogData.published !== false,
      views: blogData.views || "1.2k",
      subtitle: blogData.subtitle?.trim() || "",
      keyTakeaways: Array.isArray(blogData.keyTakeaways)
        ? blogData.keyTakeaways
        : [],
      content: blogData.content?.trim() || "",
      specs: Array.isArray(blogData.specs) ? blogData.specs : [],
    };

    const updated = [newBlog, ...current];
    saveAllBlogs(updated);
    return newBlog;
  }
}

/**
 * 4. Update an existing blog (PUT /api/blogs/:id)
 */
export async function updateBlog(id, blogData) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.put(`${base}/blogs/${id}`, blogData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    backendBlogApiAvailable = true;
    return response.data?.blog;
  } catch (error) {
    // In-memory fallback
    const current = getAllBlogs();
    const updated = current.map((item) => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          ...blogData,
          author: blogData.author || item.author,
          keyTakeaways:
            blogData.keyTakeaways !== undefined
              ? blogData.keyTakeaways
              : item.keyTakeaways,
          specs: blogData.specs !== undefined ? blogData.specs : item.specs,
        };
      }
      return item;
    });
    saveAllBlogs(updated);
    return updated.find((b) => String(b.id) === String(id));
  }
}

/**
 * 5. Delete a blog (DELETE /api/blogs/:id)
 */
export async function deleteBlog(id) {
  const base = getBaseApiUrl();
  try {
    await axios.delete(`${base}/blogs/${id}`, {
      headers: getAuthHeaders(),
    });
    backendBlogApiAvailable = true;
    return true;
  } catch (error) {
    // In-memory fallback
    const current = getAllBlogs();
    const updated = current.filter((b) => String(b.id) !== String(id));
    saveAllBlogs(updated);
    return true;
  }
}

/**
 * 6. Upload a blog cover image (POST /api/blogs/upload-image)
 */
export async function uploadBlogImage(file) {
  if (!file) {
    throw new Error("Please select an image file to upload.");
  }

  const base = getBaseApiUrl();
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(`${base}/blogs/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      image_url: response.data.image_url,
      cloudinary_public_id: response.data.cloudinary_public_id,
    };
  } catch (error) {
    // If backend upload endpoint not available, read as base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ image_url: reader.result, cloudinary_public_id: null });
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }
}
