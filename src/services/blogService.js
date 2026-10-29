import axios from "axios";
import { getAuthToken } from "../utils/auth.js";
import { getBaseApiUrl } from "../config/env";

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

/**
 * Helper to extract descriptive error messages from Axios responses
 */
const handleAxiosError = (error, defaultMessage) => {
  const backendMsg = error?.response?.data?.message;
  const message = backendMsg || error?.message || defaultMessage;
  const err = new Error(message);
  err.response = error?.response;
  throw err;
};

/**
 * 1. Fetch blogs for admin (GET /api/blogs?status=all | active | inactive)
 */
export async function fetchBlogs(status = "all") {
  const base = getBaseApiUrl();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const response = await axios.get(`${base}/blogs${query}`, {
      headers: getAuthHeaders(),
    });
    return Array.isArray(response.data?.blogs) ? response.data.blogs : [];
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch blogs from server.");
  }
}

/**
 * 2. Fetch a single blog by ID (GET /api/blogs/:id)
 */
export async function fetchBlogById(id) {
  if (!id) throw new Error("Blog ID is required.");
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/blogs/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.blog || null;
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch blog details.");
  }
}

/**
 * 3. Create a new blog post (POST /api/blogs)
 */
export async function createBlog(blogData) {
  const base = getBaseApiUrl();
  try {
    const payload = {
      title: blogData.title?.trim(),
      slug: blogData.slug ? blogData.slug.trim() : undefined,
      thumbnail_url: blogData.thumbnail_url || blogData.image || null,
      thumbnail_public_id: blogData.thumbnail_public_id || blogData.cloudinary_public_id || null,
      category: blogData.category?.trim() || blogData.tag?.trim() || "Surgical Innovation",
      excerpt: blogData.excerpt?.trim(),
      article_subtitle: blogData.article_subtitle?.trim() || blogData.subtitle?.trim() || null,
      key_takeaways: Array.isArray(blogData.key_takeaways)
        ? blogData.key_takeaways
        : (Array.isArray(blogData.keyTakeaways) ? blogData.keyTakeaways : null),
      article_content: blogData.article_content?.trim() || blogData.content?.trim() || null,
      article_sections: Array.isArray(blogData.article_sections)
        ? blogData.article_sections
        : (Array.isArray(blogData.sections) ? blogData.sections : null),
      benchmark_specs: Array.isArray(blogData.benchmark_specs)
        ? blogData.benchmark_specs
        : (Array.isArray(blogData.specs) ? blogData.specs : null),
      enquiry_cta: blogData.enquiry_cta || null,
      author_name: blogData.author_name?.trim() || blogData.author?.name?.trim() || "Reinforce Clinical Team",
      author_role: blogData.author_role?.trim() || blogData.author?.role?.trim() || "Surgical Equipment Specialist",
      author_avatar_url: blogData.author_avatar_url || null,
      author_avatar_public_id: blogData.author_avatar_public_id || null,
      published_at: blogData.published_at || blogData.date || null,
      reading_time: blogData.reading_time || blogData.readTime || null,
      is_featured: Boolean(blogData.is_featured ?? blogData.featured),
      is_active: Boolean(blogData.is_active ?? (blogData.published !== false)),
    };

    const response = await axios.post(`${base}/blogs`, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data?.blog;
  } catch (error) {
    return handleAxiosError(error, "Failed to create blog post.");
  }
}

/**
 * 4. Update an existing blog post (PUT /api/blogs/:id)
 */
export async function updateBlog(id, blogData) {
  if (!id) throw new Error("Blog ID is required for update.");
  const base = getBaseApiUrl();

  const payload = {};
  if (blogData.title !== undefined) payload.title = blogData.title.trim();
  if (blogData.slug !== undefined) payload.slug = blogData.slug.trim();
  if (blogData.excerpt !== undefined) payload.excerpt = blogData.excerpt.trim();
  if (blogData.category !== undefined) payload.category = blogData.category?.trim();
  if (blogData.article_subtitle !== undefined) payload.article_subtitle = blogData.article_subtitle?.trim();
  if (blogData.subtitle !== undefined && payload.article_subtitle === undefined) {
    payload.article_subtitle = blogData.subtitle?.trim();
  }
  if (blogData.article_content !== undefined) payload.article_content = blogData.article_content?.trim();
  if (blogData.content !== undefined && payload.article_content === undefined) {
    payload.article_content = blogData.content?.trim();
  }
  if (blogData.key_takeaways !== undefined) payload.key_takeaways = blogData.key_takeaways;
  if (blogData.keyTakeaways !== undefined && payload.key_takeaways === undefined) {
    payload.key_takeaways = blogData.keyTakeaways;
  }
  if (blogData.article_sections !== undefined) payload.article_sections = blogData.article_sections;
  if (blogData.sections !== undefined && payload.article_sections === undefined) {
    payload.article_sections = blogData.sections;
  }
  if (blogData.benchmark_specs !== undefined) payload.benchmark_specs = blogData.benchmark_specs;
  if (blogData.specs !== undefined && payload.benchmark_specs === undefined) {
    payload.benchmark_specs = blogData.specs;
  }
  if (blogData.thumbnail_url !== undefined) payload.thumbnail_url = blogData.thumbnail_url;
  if (blogData.image !== undefined && payload.thumbnail_url === undefined) {
    payload.thumbnail_url = blogData.image;
  }
  if (blogData.thumbnail_public_id !== undefined) payload.thumbnail_public_id = blogData.thumbnail_public_id;
  if (blogData.cloudinary_public_id !== undefined && payload.thumbnail_public_id === undefined) {
    payload.thumbnail_public_id = blogData.cloudinary_public_id;
  }
  if (blogData.author_name !== undefined) payload.author_name = blogData.author_name;
  if (blogData.author?.name !== undefined && payload.author_name === undefined) {
    payload.author_name = blogData.author.name;
  }
  if (blogData.author_role !== undefined) payload.author_role = blogData.author_role;
  if (blogData.author?.role !== undefined && payload.author_role === undefined) {
    payload.author_role = blogData.author.role;
  }
  if (blogData.published_at !== undefined) payload.published_at = blogData.published_at;
  if (blogData.date !== undefined && payload.published_at === undefined) {
    payload.published_at = blogData.date;
  }
  if (blogData.reading_time !== undefined) payload.reading_time = blogData.reading_time;
  if (blogData.readTime !== undefined && payload.reading_time === undefined) {
    payload.reading_time = blogData.readTime;
  }
  if (blogData.is_featured !== undefined) payload.is_featured = Boolean(blogData.is_featured);
  if (blogData.featured !== undefined && payload.is_featured === undefined) {
    payload.is_featured = Boolean(blogData.featured);
  }
  if (blogData.is_active !== undefined) payload.is_active = Boolean(blogData.is_active);
  if (blogData.published !== undefined && payload.is_active === undefined) {
    payload.is_active = Boolean(blogData.published);
  }

  try {
    const response = await axios.put(`${base}/blogs/${id}`, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data?.blog;
  } catch (error) {
    return handleAxiosError(error, "Failed to update blog post.");
  }
}

/**
 * 5. Soft-delete a blog post (DELETE /api/blogs/:id)
 */
export async function deleteBlog(id) {
  if (!id) throw new Error("Blog ID is required for deletion.");
  const base = getBaseApiUrl();
  try {
    const response = await axios.delete(`${base}/blogs/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error, "Failed to delete blog post.");
  }
}

/**
 * 6. Upload a blog cover/thumbnail image (POST /api/blogs/upload-image)
 * Uses multipart/form-data with field name 'image'
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
      thumbnail_url: response.data.thumbnail_url,
      thumbnail_public_id: response.data.thumbnail_public_id,
      image_url: response.data.thumbnail_url,
      cloudinary_public_id: response.data.thumbnail_public_id,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to upload blog thumbnail image.");
  }
}
