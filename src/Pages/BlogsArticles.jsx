import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import BlogsTab from "../Components/DashboardTabs/BlogsTab";
import SEO from "../Components/SEO";
import { getAllBlogs } from "../utils/blogStorage";

/**
 * BlogsArticles Page
 * Route: /dashboard/blogs (or /admin/blogs)
 * Dedicated page for managing website blog posts and articles.
 */
function BlogsArticles({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localBlogs, setLocalBlogs] = useState(() => getAllBlogs());

  const blogs = context.blogs ?? localBlogs;
  const setBlogs = context.setBlogs ?? setLocalBlogs;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalBlogs(getAllBlogs());
    };
    window.addEventListener("rhs_blogs_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_blogs_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="Blogs & Articles Management | Reinforce Healthcare Services"
        description="Create, edit, and organize editorial blog posts and educational healthcare articles."
      />
      <BlogsTab
        blogs={blogs}
        setBlogs={setBlogs}
        showNotify={showNotify}
      />
    </>
  );
}

export default BlogsArticles;
