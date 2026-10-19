import { useState, useRef, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  Eye,
  Calendar,
  Clock,
  Upload,
  X,
  Check,
  RotateCcw,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Storage helpers and presets
import {
  addBlog,
  updateBlog,
  deleteBlog,
  resetBlogs,
  BLOG_IMAGE_PRESETS,
} from "../../utils/blogStorage";
import { readFileAsBase64 } from "../../utils/fileUtils";

const CATEGORY_TAG_PRESETS = [
  "Surgical Innovation",
  "Product Guide",
  "Hospital Insights",
  "Case Study",
  "Endourology",
  "Laser Tech",
];

export default function BlogsTab({ blogs, setBlogs, showNotify }) {
  // Modal states
  const [editingBlog, setEditingBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Featured' | 'Published' | 'Draft'

  // Hidden file input reference for cover image upload
  const fileInputRef = useRef(null);

  // Helper to determine the image to display (custom upload vs built-in preset)
  const getBlogDisplayImage = (blogObj) => {
    if (blogObj?.image && typeof blogObj.image === "string" && blogObj.image.trim() !== "") {
      return blogObj.image;
    }
    if (blogObj?.presetKey && BLOG_IMAGE_PRESETS.some((p) => p.id === blogObj.presetKey)) {
      const found = BLOG_IMAGE_PRESETS.find((p) => p.id === blogObj.presetKey);
      return found ? found.src : BLOG_IMAGE_PRESETS[0].src;
    }
    return BLOG_IMAGE_PRESETS[0]?.src || "";
  };

  // -------------------------------------------------------------
  // MODAL HANDLERS
  // -------------------------------------------------------------
  const openNewBlogModal = () => {
    setEditingBlog({
      id: "new",
      tag: "Surgical Innovation",
      title: "Advancements in High-Precision Laser Lithotripsy",
      date: new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      readTime: "5 min read",
      author: {
        name: "Dr. Arvind Mehta",
        role: "Sr. Laparoscopic Surgeon",
        initials: "AM",
      },
      excerpt:
        "Analyzing clinical outcomes, thermal spread margins, and operative turnaround across modern surgical suites.",
      presetKey: "blog_3",
      image: "",
      featured: false,
      published: true,
      views: "1.2k",
    });
    setIsModalOpen(true);
  };

  const openEditBlogModal = (post) => {
    setEditingBlog({
      ...post,
      author: post.author || {
        name: "Reinforce Clinical Team",
        role: "Surgical Equipment Specialist",
        initials: "RC",
      },
      featured: Boolean(post.featured),
      published: post.published !== false,
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // CRUD ACTIONS
  // -------------------------------------------------------------
  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!editingBlog) return;

    if (editingBlog.id === "new") {
      const updatedList = addBlog(editingBlog);
      setBlogs(updatedList);
      showNotify("New blog post published successfully!");
    } else {
      const updatedList = updateBlog(editingBlog.id, editingBlog);
      setBlogs(updatedList);
      showNotify("Blog post updated successfully!");
    }

    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleDeleteBlog = (id, title) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${title || "this blog post"}"? This will remove it from the public /blogs page.`
    );
    if (!isConfirmed) return;

    const updatedList = deleteBlog(id);
    setBlogs(updatedList);
    if (editingBlog?.id === id) setEditingBlog(null);
    showNotify("Blog post deleted successfully.");
  };

  const handleToggleFeatured = (blog) => {
    const updated = updateBlog(blog.id, {
      featured: !blog.featured,
    });
    setBlogs(updated);
    showNotify(
      blog.featured
        ? `Removed "${blog.title.slice(0, 24)}..." from Spotlight`
        : `Marked "${blog.title.slice(0, 24)}..." as Featured Spotlight!`
    );
  };

  const handleTogglePublished = (blog) => {
    const currentStatus = blog.published !== false;
    const updated = updateBlog(blog.id, {
      published: !currentStatus,
    });
    setBlogs(updated);
    showNotify(
      currentStatus
        ? `Article drafted (hidden from public view).`
        : `Article published live to /blogs!`
    );
  };

  const handleResetBlogs = () => {
    const isConfirmed = window.confirm(
      "Reset all blog posts to the official factory default list?"
    );
    if (!isConfirmed) return;

    const defaults = resetBlogs();
    setBlogs(defaults);
    setEditingBlog(null);
    showNotify("All blog posts reset to factory defaults.");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFileAsBase64(
      file,
      (base64String) => {
        setEditingBlog((prev) => ({
          ...prev,
          image: base64String,
          presetKey: "",
        }));
        showNotify("Cover image uploaded successfully.");
      },
      (errorMessage) => {
        showNotify(errorMessage, "error");
      }
    );
  };

  // Derive unique categories for filtering
  const availableTags = useMemo(() => {
    const tags = blogs.map((b) => b.tag).filter(Boolean);
    return ["All", ...Array.from(new Set(tags))];
  }, [blogs]);

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = blog.title?.toLowerCase().includes(q);
        const excerptMatch = blog.excerpt?.toLowerCase().includes(q);
        const tagMatch = blog.tag?.toLowerCase().includes(q);
        const authorMatch = blog.author?.name?.toLowerCase().includes(q);
        if (!titleMatch && !excerptMatch && !tagMatch && !authorMatch) return false;
      }

      // Tag filter
      if (selectedTag !== "All") {
        if (blog.tag?.toLowerCase() !== selectedTag.toLowerCase()) return false;
      }

      // Status filter
      if (statusFilter === "Featured" && !blog.featured) return false;
      if (statusFilter === "Published" && blog.published === false) return false;
      if (statusFilter === "Draft" && blog.published !== false) return false;

      return true;
    });
  }, [blogs, searchQuery, selectedTag, statusFilter]);

  // Counts
  const publishedCount = blogs.filter((b) => b.published !== false).length;
  const featuredCount = blogs.filter((b) => b.featured).length;

  return (
    <div className="space-y-6 pb-16">
      {/* =========================================================================
          TOP COMMAND & HEADER BAR
      ========================================================================= */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/25">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Blog & Article Management</h2>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                {blogs.length} Total
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {publishedCount} Live
              </span>
              {featuredCount > 0 && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {featuredCount} Spotlight
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Create, edit, and manage editorial surgical guides and hospital articles for the public website.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetBlogs}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
            title="Reset to factory default articles"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <a
            href="http://localhost:5174/blogs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/60 px-3.5 py-2 text-xs font-bold text-primary hover:bg-sky-100 transition-all cursor-pointer"
            title="Open public website /blogs in a new tab"
          >
            <span>Live /blogs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={openNewBlogModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Blog Post</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FULL ARTICLE MANAGEMENT SECTION (EDITORIAL CONTROL CENTER)
      ========================================================================= */}
      <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Filter:
            </span>

            {/* Category Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-primary focus:outline-none"
            >
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  Category: {tag}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-primary focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Live</option>
              <option value="Featured">Featured Spotlight</option>
              <option value="Draft">Drafts Only</option>
            </select>

            {(selectedTag !== "All" || statusFilter !== "All" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTag("All");
                  setStatusFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-primary hover:underline ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, tag, author..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredBlogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-700">No Articles Found</h3>
              <p className="mt-1 text-xs text-slate-500">
                No blog posts match your current search and filter combination.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTag("All");
                  setStatusFilter("All");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredBlogs.map((post, index) => {
              const displayImage = getBlogDisplayImage(post);
              const isPublished = post.published !== false;

              return (
                <div
                  key={post.id || index}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 p-5 sm:p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Thumbnail Column */}
                    <div className="md:col-span-3">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <BookOpen className="h-8 w-8" />
                          </div>
                        )}
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs backdrop-blur-sm">
                          {post.tag || "Article"}
                        </span>
                        {post.featured && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3 fill-white" />
                            <span>Spotlight</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Article Details Column */}
                    <div className="md:col-span-6 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {post.date || "—"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {post.readTime || "5 min read"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {post.views || "1.2k"} reads
                        </span>
                      </div>

                      <h3 className="mt-2 text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Author Bar */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-primary-dark">
                          {post.author?.initials || "RH"}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {post.author?.name || "Reinforce Clinical Team"}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({post.author?.role || "Specialist"})
                        </span>
                      </div>
                    </div>

                    {/* Quick Controls & Actions Column */}
                    <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Toggles */}
                      <div className="flex items-center gap-2">
                        {/* Featured Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(post)}
                          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                            post.featured
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:text-amber-600"
                          }`}
                          title={post.featured ? "Remove from Spotlight" : "Feature on Spotlight"}
                        >
                          <Star
                            className="h-3.5 w-3.5"
                            fill={post.featured ? "currentColor" : "none"}
                          />
                          <span>{post.featured ? "Featured" : "Spotlight"}</span>
                        </button>

                        {/* Published Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(post)}
                          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                          title="Toggle live visibility"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isPublished ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditBlogModal(post)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={blogs.length <= 1}
                          onClick={() => handleDeleteBlog(post.id, post.title)}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT BLOG POST
      ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && editingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingBlog.id === "new" ? "Create New Blog Post" : "Edit Blog Article"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Changes will instantly reflect on the public /blogs carousel and reader.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveBlog} className="mt-6 space-y-4">
                {/* Category Tag with Quick Suggestions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlog.tag || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, tag: e.target.value })}
                    placeholder="e.g. Surgical Innovation"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CATEGORY_TAG_PRESETS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditingBlog({ ...editingBlog, tag: t })}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                          editingBlog.tag === t
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blog Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    placeholder="e.g. The Rise of Bipolar Plasma Technology in Modern OTs"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Publish Date & Read Time */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Publish Date
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBlog.date || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                      placeholder="e.g. 12 Aug 2026"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Reading Time
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBlog.readTime || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                      placeholder="e.g. 5 min read"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Author Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={editingBlog.author?.name || ""}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          author: {
                            ...editingBlog.author,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Dr. Arvind Mehta"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Author Role / Title
                    </label>
                    <input
                      type="text"
                      value={editingBlog.author?.role || ""}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          author: {
                            ...editingBlog.author,
                            role: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Sr. Laparoscopic Surgeon"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Executive Summary / Excerpt
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingBlog.excerpt || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                    placeholder="Provide a concise clinical summary..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Cover Image: Upload or Built-in Preset */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cover Image Preview & Selection
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                      <img
                        src={getBlogDisplayImage(editingBlog)}
                        alt="Blog cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Custom Image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, or WebP. Or choose from preset clinical photography:
                      </p>
                    </div>
                  </div>

                  {/* Preset Cover Images */}
                  <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
                    {BLOG_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setEditingBlog((prev) => ({
                            ...prev,
                            presetKey: preset.id,
                            image: "",
                          }))
                        }
                        className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition cursor-pointer ${
                          editingBlog.presetKey === preset.id && !editingBlog.image
                            ? "border-primary bg-primary/10 text-primary-dark ring-2 ring-primary/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <img
                          src={preset.src}
                          alt={preset.label}
                          className="h-8 w-12 shrink-0 rounded-lg object-cover"
                        />
                        <span className="truncate text-[10px]">{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {editingBlog.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingBlog((prev) => ({
                          ...prev,
                          image: "",
                          presetKey: "blog_3",
                        }))
                      }
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove custom upload (use preset)
                    </button>
                  )}
                </div>

                {/* Toggles: Featured & Published */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-amber-300 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(editingBlog.featured)}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, featured: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        Feature in Spotlight
                      </span>
                      <p className="text-[10px] text-slate-400">Display prominent spotlight badge</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-emerald-300 transition">
                    <input
                      type="checkbox"
                      checked={editingBlog.published !== false}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, published: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        Publish Status (Live)
                      </span>
                      <p className="text-[10px] text-slate-400">Visible on public /blogs page</p>
                    </div>
                  </label>
                </div>

                {/* Form Action Buttons */}
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
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 transition cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save & Publish Article</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
