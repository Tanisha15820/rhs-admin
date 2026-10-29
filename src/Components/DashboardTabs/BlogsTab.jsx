import { useState, useEffect, useRef, useCallback } from "react";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CircularProgress from "@mui/material/CircularProgress";

// Storage, services, and image presets
import {
  fetchBlogs,
  fetchBlogById,

  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} from "../../services/blogService";
import { getResolvedBlogImage } from "../../utils/blogStorage";

export default function BlogsTab({ showNotify, onBlogsChanged }) {
  // Blog records state
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and form states
  const [editingBlog, setEditingBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  // Preview reader modal state
  const [previewBlog, setPreviewBlog] = useState(null);

  // File input ref for cover image upload
  const fileInputRef = useRef(null);

  // Notify parent dashboard on data mutations without causing render loops
  const notifyChange = useCallback(() => {
    if (onBlogsChanged) {
      onBlogsChanged();
    }
    window.dispatchEvent(new CustomEvent("rhs_blogs_updated"));
  }, [onBlogsChanged]);

  // -------------------------------------------------------------
  // 1. LOAD BLOGS (Clean, stable fetch without circular dependencies)
  // -------------------------------------------------------------
  const loadBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlogs("all");
      setBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      showNotify?.(err.message || "Failed to load blogs from server.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // -------------------------------------------------------------
  // 2. OPEN ADD MODAL
  // -------------------------------------------------------------
  const openNewBlogModal = () => {
    setFormError("");
    const today = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setEditingBlog({
      id: "new",
      title: "",
      category: "Surgical Innovation",
      tag: "Surgical Innovation",
      excerpt: "",
      subtitle: "",
      keyTakeawaysText: "",
      content: "",
      date: today,
      readTime: "5 min read",
      authorName: "Dr. Arvind Mehta",
      authorRole: "Sr. Laparoscopic Surgeon",
      authorInitials: "AM",
      image: "",
      thumbnail_url: "",
      thumbnail_public_id: null,
      featured: false,
      published: true,
      views: "0",
      specs: [],
      sections: [],
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. OPEN EDIT MODAL
  // -------------------------------------------------------------
  const openEditBlogModal = async (blog) => {
    setFormError("");
    const takeaways = Array.isArray(blog.key_takeaways || blog.keyTakeaways)
      ? (blog.key_takeaways || blog.keyTakeaways).join("\n")
      : "";

    // Set initial values from card while fetching fresh full article
    setEditingBlog({
      id: blog.id,
      title: blog.title || "",
      category: blog.category || blog.tag || "Surgical Innovation",
      tag: blog.category || blog.tag || "Surgical Innovation",
      excerpt: blog.excerpt || "",
      subtitle: blog.article_subtitle || blog.subtitle || "",
      keyTakeawaysText: takeaways,
      content: blog.article_content || blog.content || "",
      date: blog.published_at || blog.date || "",
      readTime: blog.reading_time || blog.readTime || "5 min read",
      authorName: blog.author_name || blog.author?.name || "Reinforce Clinical Team",
      authorRole: blog.author_role || blog.author?.role || "Surgical Equipment Specialist",
      authorInitials: (blog.author_name || blog.author?.name || "RC")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "RC",
      image: blog.thumbnail_url || blog.image || "",
      thumbnail_url: blog.thumbnail_url || blog.image || "",
      thumbnail_public_id: blog.thumbnail_public_id || null,
      featured: Boolean(blog.is_featured ?? blog.featured),
      published: blog.is_active !== undefined ? Boolean(blog.is_active) : (blog.published !== false),
      views: blog.read_count !== undefined ? String(blog.read_count) : (blog.views || "1.2k"),
      specs: blog.benchmark_specs || blog.specs || [],
      sections: blog.article_sections || blog.sections || [],
    });
    setIsModalOpen(true);

    try {
      const fresh = await fetchBlogById(blog.id);
      if (fresh) {
        const freshTakeaways = Array.isArray(fresh.key_takeaways)
          ? fresh.key_takeaways.join("\n")
          : (Array.isArray(fresh.keyTakeaways) ? fresh.keyTakeaways.join("\n") : "");

        setEditingBlog((prev) => ({
          ...prev,
          id: fresh.id,
          title: fresh.title || prev.title,
          category: fresh.category || fresh.tag || prev.category,
          tag: fresh.category || fresh.tag || prev.tag,
          excerpt: fresh.excerpt || prev.excerpt,
          subtitle: fresh.article_subtitle || fresh.subtitle || prev.subtitle,
          keyTakeawaysText: freshTakeaways !== "" ? freshTakeaways : prev.keyTakeawaysText,
          content: fresh.article_content || fresh.content || prev.content,
          date: fresh.published_at || fresh.date || prev.date,
          readTime: fresh.reading_time || fresh.readTime || prev.readTime,
          authorName: fresh.author_name || fresh.author?.name || prev.authorName,
          authorRole: fresh.author_role || fresh.author?.role || prev.authorRole,
          authorInitials: (fresh.author_name || fresh.author?.name || prev.authorName)
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "RC",
          image: fresh.thumbnail_url || fresh.image || prev.image,
          thumbnail_url: fresh.thumbnail_url || fresh.image || prev.thumbnail_url,
          thumbnail_public_id: fresh.thumbnail_public_id || prev.thumbnail_public_id,
          featured: Boolean(fresh.is_featured ?? fresh.featured),
          published: fresh.is_active !== undefined ? Boolean(fresh.is_active) : (fresh.published !== false),
          views: fresh.read_count !== undefined ? String(fresh.read_count) : prev.views,
          specs: fresh.benchmark_specs || fresh.specs || prev.specs,
          sections: fresh.article_sections || fresh.sections || prev.sections,
        }));
      }
    } catch (err) {
      console.warn("Could not fetch full details, using card data:", err);
    }
  };

  // -------------------------------------------------------------
  // 4. IMAGE UPLOAD HANDLER
  // -------------------------------------------------------------
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image file size must be less than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFormError("Only JPEG, PNG and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFormError("");
    setIsUploadingImage(true);

    try {
      const res = await uploadBlogImage(file);
      setEditingBlog((prev) => ({
        ...prev,
        image: res.thumbnail_url || res.image_url,
        thumbnail_url: res.thumbnail_url || res.image_url,
        thumbnail_public_id: res.thumbnail_public_id || res.cloudinary_public_id || null,
      }));
      showNotify?.("Cover image uploaded successfully!");
    } catch (err) {
      console.error("Blog image upload error:", err);
      setFormError(err.message || "Failed to upload image.");
      showNotify?.(err.message || "Failed to upload image.", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------------------------------------
  // 5. SAVE BLOG (ADD OR EDIT)
  // -------------------------------------------------------------
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog || isSubmitting || isUploadingImage) return;

    const trimmedTitle = (editingBlog.title || "").trim();
    if (!trimmedTitle) {
      setFormError("Please enter the blog title.");
      return;
    }

    const trimmedExcerpt = (editingBlog.excerpt || "").trim();
    if (!trimmedExcerpt) {
      setFormError("Please enter a short description or excerpt.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    // Parse takeaways lines
    const keyTakeaways = (editingBlog.keyTakeawaysText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // Derive initials if needed
    const authorName = (editingBlog.authorName || "Reinforce Clinical Team").trim();

    // Automatic publication date generation
    const autoDate =
      (editingBlog.date || "").trim() ||
      new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    // Automatic reading time calculation
    const autoReadTime = (() => {
      if (editingBlog.id !== "new" && editingBlog.readTime) {
        return editingBlog.readTime;
      }
      const fullText = `${trimmedExcerpt} ${(editingBlog.content || "")}`.trim();
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(3, Math.ceil(wordCount / 120));
      return `${minutes} min read`;
    })();

    const blogPayload = {
      title: trimmedTitle,
      category: (editingBlog.category || editingBlog.tag || "Surgical Innovation").trim(),
      excerpt: trimmedExcerpt,
      article_subtitle: (editingBlog.subtitle || "").trim(),
      key_takeaways: keyTakeaways,
      article_content: (editingBlog.content || "").trim(),
      published_at: autoDate,
      reading_time: autoReadTime,
      author_name: authorName,
      author_role: (editingBlog.authorRole || "Surgical Equipment Specialist").trim(),
      thumbnail_url: editingBlog.thumbnail_url || editingBlog.image || null,
      thumbnail_public_id: editingBlog.thumbnail_public_id || null,
      is_featured: Boolean(editingBlog.featured),
      is_active: editingBlog.published !== false,
      article_sections: editingBlog.sections || [],
      benchmark_specs: editingBlog.specs || [],
    };

    try {
      if (editingBlog.id === "new") {
        await createBlog(blogPayload);
        showNotify?.("New blog post created successfully!");
      } else {
        await updateBlog(editingBlog.id, blogPayload);
        showNotify?.("Blog post updated successfully!");
      }

      setIsModalOpen(false);
      setEditingBlog(null);
      await loadBlogs();
      notifyChange();
    } catch (err) {
      console.error("Save blog error:", err);
      setFormError(err.message || "Failed to save blog post.");
      showNotify?.(err.message || "Failed to save blog post.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 6. DELETE BLOG
  // -------------------------------------------------------------
  const handleDeleteBlog = async (id, title) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${title || "this blog article"}"?`
    );
    if (!isConfirmed) return;

    try {
      await deleteBlog(id);
      showNotify?.("Blog article deleted successfully.");
      await loadBlogs();
      notifyChange();
    } catch (err) {
      console.error("Delete blog error:", err);
      showNotify?.(err.message || "Failed to delete blog article.", "error");
    }
  };

  // -------------------------------------------------------------
  // 7. STATUS TOGGLE (ACTIVE / INACTIVE)
  // -------------------------------------------------------------
  const handleToggleStatus = async (blog) => {
    const isCurrentActive =
      blog.is_active !== undefined ? blog.is_active : blog.published !== false;
    const nextActive = !isCurrentActive;
    try {
      await updateBlog(blog.id, { is_active: nextActive });
      showNotify?.(
        `Blog "${(blog.title || "article").slice(0, 20)}..." ${nextActive ? "published" : "unpublished"
        } successfully!`
      );
      await loadBlogs();
      notifyChange();
    } catch (err) {
      console.error("Status toggle error:", err);
      showNotify?.(err.message || "Failed to update blog status.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* TOP HEADER COMMAND BAR                                    */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArticleOutlinedIcon className="text-primary" />
            Blogs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage surgical guides, laser technology clinical articles, and healthcare publications for the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openNewBlogModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add Blog</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LOADING STATE                                             */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200/80 bg-white">
          <CircularProgress size={36} className="text-primary" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading blog articles...
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* EMPTY STATE                                               */}
      {/* ========================================================= */}
      {!isLoading && blogs.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ArticleOutlinedIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No blog articles found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            No blog articles exist yet. Click Add Blog to create your first publication.
          </p>
          <button
            type="button"
            onClick={openNewBlogModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 16 }} />
            <span>Add First Blog</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* BLOG CARDS GRID (MATCHING RHS WEBSITE DESIGN)             */}
      {/* ========================================================= */}
      {!isLoading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, index) => {
            const displayImage = getResolvedBlogImage(blog);
            const isPublished =
              blog.is_active !== undefined ? blog.is_active : blog.published !== false;
            const authorDisplayName =
              blog.author_name || blog.author?.name || "Reinforce Clinical Team";
            const authorDisplayRole =
              blog.author_role || blog.author?.role || "Specialist";
            const authorInitials = authorDisplayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "RH";

            return (
              <div
                key={blog.id || index}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xl hover:border-primary/40 transition-all duration-300"
              >
                {/* Top Action Bar */}
                <div className="flex items-center justify-between p-4 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditBlogModal(blog)}
                      className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                      title="Edit Blog Post"
                    >
                      <EditNoteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBlog(blog.id, blog.title)}
                      className="rounded-lg border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Blog Post"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Area (16:10 aspect ratio matching website) */}
                <div className="relative mx-4 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  <img
                    src={displayImage}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                  {/* Reading Time Pill */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    <AccessTimeOutlinedIcon style={{ fontSize: 12 }} className="text-sky-300" />
                    <span>{blog.reading_time || blog.readTime || "5 min read"}</span>
                  </div>
                </div>

                {/* Blog Card Content */}
                <div className="p-4 pt-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date & Views Row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <CalendarTodayOutlinedIcon style={{ fontSize: 12 }} />
                        {blog.published_at || blog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <RemoveRedEyeOutlinedIcon style={{ fontSize: 13 }} />
                        {blog.read_count !== undefined ? `${blog.read_count}` : (blog.views || "1.2k")} reads
                      </span>
                    </div>

                    {/* Blog Title */}
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  {/* Author Bar */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-primary-dark">
                      {authorInitials}
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {authorDisplayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {authorDisplayRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status & Quick Reader Preview */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(blog)}
                      className="cursor-pointer transition hover:opacity-80"
                      title="Click to toggle publish status"
                    >
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active / Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Draft / Inactive
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewBlog(blog)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
                  >
                    <VisibilityOutlinedIcon style={{ fontSize: 15 }} />
                    <span>Reader Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT BLOG ARTICLE                            */}
      {/* ========================================================= */}
      {isModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingBlog.id === "new" ? "Add New Blog Article" : "Edit Blog Article"}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage the publication fields displayed on the RHS website blog card and reader.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBlog(null);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBlog} className="mt-5 space-y-4">
              {/* Blog Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingBlog.title || ""}
                  onChange={(e) =>
                    setEditingBlog((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. The Rise of Bipolar Plasma Technology in Modern OTs"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Blog Thumbnail / Featured Image
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <img
                      src={getResolvedBlogImage(editingBlog)}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition">
                      {isUploadingImage ? (
                        <CircularProgress size={16} className="text-white" />
                      ) : (
                        <CloudUploadOutlinedIcon style={{ fontSize: 18 }} />
                      )}
                      <span>
                        {isUploadingImage
                          ? "Uploading..."
                          : editingBlog.image || editingBlog.thumbnail_url
                            ? "Replace Cover Image"
                            : "Upload Cover Image"}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WebP (Max 5MB). Preserves current image if no file is uploaded.
                    </p>
                  </div>
                </div>
              </div>

              {/* Short Description / Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description / Excerpt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingBlog.excerpt || ""}
                  onChange={(e) =>
                    setEditingBlog((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Provide a concise summary displayed on the blog card..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Full Article Content Section */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Reader Content (Website Reader Modal)
                </span>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Article Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={editingBlog.subtitle || ""}
                    onChange={(e) =>
                      setEditingBlog((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g. A deep dive into sub-millimeter thermal margin control..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Key Takeaways */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Key Clinical Takeaways (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editingBlog.keyTakeawaysText || ""}
                    onChange={(e) =>
                      setEditingBlog((prev) => ({
                        ...prev,
                        keyTakeawaysText: e.target.value,
                      }))
                    }
                    placeholder="Thermal spread restricted to <0.8mm&#10;Enables simultaneous resection and hemostasis&#10;Reduces postoperative edema"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Full Article Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Full Article Text
                  </label>
                  <textarea
                    rows={4}
                    value={editingBlog.content || ""}
                    onChange={(e) =>
                      setEditingBlog((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Enter detailed clinical content and analysis..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Author Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={editingBlog.authorName || ""}
                    onChange={(e) =>
                      setEditingBlog((prev) => ({
                        ...prev,
                        authorName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Dr. Arvind Mehta"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author Role / Title
                  </label>
                  <input
                    type="text"
                    value={editingBlog.authorRole || ""}
                    onChange={(e) =>
                      setEditingBlog((prev) => ({
                        ...prev,
                        authorRole: e.target.value,
                      }))
                    }
                    placeholder="e.g. Sr. Laparoscopic Surgeon"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status Option */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={editingBlog.published ? "Active" : "Inactive"}
                  onChange={(e) =>
                    setEditingBlog((prev) => ({
                      ...prev,
                      published: e.target.value === "Active",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Active">Active (Published live)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <CircularProgress size={14} className="text-white" />
                  ) : (
                    <CheckCircleOutlinedIcon style={{ fontSize: 18 }} />
                  )}
                  <span>
                    {editingBlog.id === "new" ? "Save & Publish Blog" : "Update Blog"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK READER PREVIEW MODAL (EXACT RHS WEBSITE READER)     */}
      {/* ========================================================= */}
      {previewBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setPreviewBlog(null)}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer"
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </button>

            {/* Category, Date, Read Time */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-gradient-to-r from-primary to-primary-dark px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                {previewBlog.category || previewBlog.tag || "Article"}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarTodayOutlinedIcon style={{ fontSize: 13 }} />
                {previewBlog.published_at || previewBlog.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <AccessTimeOutlinedIcon style={{ fontSize: 13 }} />
                {previewBlog.reading_time || previewBlog.readTime || "5 min read"}
              </span>
            </div>

            {/* Title */}
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {previewBlog.title}
            </h2>

            {/* Author */}
            <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-primary-dark">
                {(previewBlog.author_name || previewBlog.author?.name || "RH")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "RH"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {previewBlog.author_name || previewBlog.author?.name || "Reinforce Clinical Team"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {previewBlog.author_role || previewBlog.author?.role || "Surgical Equipment Specialist"}
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md">
              <img
                src={getResolvedBlogImage(previewBlog)}
                alt={previewBlog.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Subtitle / Excerpt */}
            {(previewBlog.article_subtitle || previewBlog.subtitle) && (
              <p className="mt-6 text-sm text-slate-600 leading-relaxed font-medium italic">
                {previewBlog.article_subtitle || previewBlog.subtitle}
              </p>
            )}

            {/* Key Takeaways */}
            {Array.isArray(previewBlog.key_takeaways || previewBlog.keyTakeaways) &&
              (previewBlog.key_takeaways || previewBlog.keyTakeaways).length > 0 && (
                <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <CheckCircleOutlinedIcon style={{ fontSize: 16 }} />
                    <span>Key Clinical Takeaways</span>
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {(previewBlog.key_takeaways || previewBlog.keyTakeaways).map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircleOutlinedIcon style={{ fontSize: 15 }} className="text-primary shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Article Content */}
            <div className="mt-6 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              {previewBlog.article_content || previewBlog.content ? (
                <p>{previewBlog.article_content || previewBlog.content}</p>
              ) : (
                <p>{previewBlog.excerpt}</p>
              )}
            </div>

            {/* Close action */}
            <div className="mt-8 border-t border-slate-100 pt-4 text-right">
              <button
                type="button"
                onClick={() => setPreviewBlog(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
