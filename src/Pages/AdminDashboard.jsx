import { useState, useEffect } from "react";
import { Outlet, useOutlet } from "react-router-dom";
import AdminLayout from "../Components/AdminLayout";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import BannersTab from "../Components/DashboardTabs/BannersTab";

// Storage getters
import { getAllBanners } from "../utils/bannerStorage";
import { getMachineProducts } from "../utils/machineStorage";
import { getAllTestimonials } from "../utils/testimonialStorage";
import { getAllFaqs } from "../utils/faqStorage";
import { getAllClients } from "../utils/clientStorage";
import { getAllBlogs } from "../utils/blogStorage";

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

  // Load all data from localStorage on initial page render and on updates
  useEffect(() => {
    const loadAllData = () => {
      setBanners(getAllBanners());
      setProducts(getMachineProducts());
      setTestimonials(getAllTestimonials());
      setFaqs(getAllFaqs());
      setClients(getAllClients());
      setBlogs(getAllBlogs());
    };

    loadAllData();

    // Listen for storage update events
    window.addEventListener("rhs_banner_updated", loadAllData);
    window.addEventListener("rhs_machine_updated", loadAllData);
    window.addEventListener("rhs_testimonials_updated", loadAllData);
    window.addEventListener("rhs_faqs_updated", loadAllData);
    window.addEventListener("rhs_clients_updated", loadAllData);
    window.addEventListener("rhs_blogs_updated", loadAllData);
    window.addEventListener("storage", loadAllData);

    return () => {
      window.removeEventListener("rhs_banner_updated", loadAllData);
      window.removeEventListener("rhs_machine_updated", loadAllData);
      window.removeEventListener("rhs_testimonials_updated", loadAllData);
      window.removeEventListener("rhs_faqs_updated", loadAllData);
      window.removeEventListener("rhs_clients_updated", loadAllData);
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
            testimonials,
            setTestimonials,
            faqs,
            setFaqs,
            clients,
            setClients,
            blogs,
            setBlogs,
            showNotify,
          }}
        />
      ) : (
        <BannersTab
          banners={banners}
          setBanners={setBanners}
          showNotify={showNotify}
        />
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
