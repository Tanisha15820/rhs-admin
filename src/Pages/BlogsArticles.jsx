import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import BlogsTab from "../Components/DashboardTabs/BlogsTab";
import SEO from "../Components/SEO";
import { clearLegacyBlogsStorage } from "../utils/blogStorage";

/**
 * Blogs Page
 * Route: /dashboard/blogs (or /admin/blogs)
 * Dedicated admin page for managing healthcare clinical blogs and surgical publications.
 */
function BlogsArticles({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Remove obsolete localStorage key if present
  useEffect(() => {
    clearLegacyBlogsStorage();
  }, []);

  return (
    <>
      <SEO
        title="Blogs | Reinforce Healthcare Services"
        description="Create, edit, and organize surgical clinical guides, laser technology articles, and healthcare publications."
      />
      <BlogsTab
        showNotify={showNotify}
        blogs={context.blogs}
        setBlogs={context.setBlogs}
      />
    </>
  );
}

export default BlogsArticles;
