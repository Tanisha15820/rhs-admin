import { useState, useEffect } from "react";
import { Outlet, useOutlet } from "react-router-dom";
import AdminLayout from "../Components/AdminLayout";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import BannersTab from "../Components/DashboardTabs/BannersTab";

// Storage getters
import { getAllBanners } from "../utils/bannerStorage";
import { fetchProducts } from "../services/productService";
import { fetchTestimonials } from "../services/testimonialService";
import { clearLegacyTestimonialsStorage } from "../utils/testimonialStorage";
import { fetchClients } from "../services/clientService";
import { clearLegacyClientsStorage } from "../utils/clientStorage";
import { getAllFaqs } from "../utils/faqStorage";
import { getAllBlogs, clearLegacyBlogsStorage } from "../utils/blogStorage";

/**
 * AdminDashboard Layout & Parent Container
 * Manages central data synchronization, toast notification system, and tab counts.
 * Renders individual routed pages via <Outlet /> within AdminLayout.
 */
function AdminDashboard() {
  const currentOutlet = useOutlet();

  // All collections stored in state
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [clients, setClients] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Toast notification feedback message
  const [notification, setNotification] = useState(null);

  // Helper to show a temporary notification popup
  const showNotify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const reloadProducts = () => {
    fetchProducts("all")
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("Failed to load products from API:", err);
      });
  };

  const reloadTestimonials = () => {
    fetchTestimonials("all")
      .then((data) => setTestimonials(data))
      .catch((err) => {
        console.error("Failed to load testimonials from API:", err);
      });
  };

  const reloadClients = () => {
    fetchClients("all")
      .then((data) => setClients(data))
      .catch((err) => {
        console.error("Failed to load clients from API:", err);
      });
  };

  // Load all data on initial page render and on updates
  useEffect(() => {
    clearLegacyTestimonialsStorage();
    clearLegacyClientsStorage();
    clearLegacyBlogsStorage();

    const loadAllData = () => {
      setBanners(getAllBanners());
      reloadProducts();
      reloadTestimonials();
      setFaqs(getAllFaqs());
      reloadClients();
      setBlogs(getAllBlogs());
    };

    loadAllData();

    // Listen for update events
    window.addEventListener("rhs_banner_updated", loadAllData);
    window.addEventListener("rhs_products_updated", reloadProducts);
    window.addEventListener("rhs_testimonials_updated", reloadTestimonials);
    window.addEventListener("rhs_faqs_updated", loadAllData);
    window.addEventListener("rhs_clients_updated", reloadClients);
    window.addEventListener("rhs_blogs_updated", loadAllData);
    window.addEventListener("storage", loadAllData);

    return () => {
      window.removeEventListener("rhs_banner_updated", loadAllData);
      window.removeEventListener("rhs_products_updated", reloadProducts);
      window.removeEventListener("rhs_testimonials_updated", reloadTestimonials);
      window.removeEventListener("rhs_faqs_updated", loadAllData);
      window.removeEventListener("rhs_clients_updated", reloadClients);
      window.removeEventListener("rhs_blogs_updated", loadAllData);
      window.removeEventListener("storage", loadAllData);
    };
  }, []);

  return (
    <AdminLayout
      counts={{
        banners: banners.length,
        products: products.length,
        testimonials: testimonials.length,
        faqs: faqs.length,
        clients: clients.length,
        blogs: blogs.length,
      }}
    >
      {/* Floating Notification Toast Popup */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-fade-in border ${
            notification.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold ${
              notification.type === "error"
                ? "bg-rose-100 text-rose-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {notification.type === "error" ? (
              "!"
            ) : (
              <CheckCircleOutlinedIcon style={{ fontSize: 20 }} />
            )}
          </div>
          <div>
            <p className="text-xs font-bold">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* Renders current distinct routed page via Outlet, or fallback */}
      {currentOutlet ? (
        <Outlet
          context={{
            banners,
            setBanners,
            products,
            setProducts,
            reloadProducts,
            testimonials,
            setTestimonials,
            reloadTestimonials,
            faqs,
            setFaqs,
            clients,
            setClients,
            reloadClients,
            blogs,
            setBlogs,
            showNotify,
          }}
        />
      ) : (
        /* Temporarily commented out fallback banner section
        <BannersTab
          banners={banners}
          setBanners={setBanners}
          showNotify={showNotify}
        />
        */
        null
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
