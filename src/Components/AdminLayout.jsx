import { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { logout } from "../utils/auth";
import logo from "../assets/images/compressed_rhs_logo.png";

const AdminLayout = ({ activeTab, setActiveTab, counts = {}, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/login", { replace: true });
    }
  };

  // Derive active tab from URL pathname if not explicitly provided
  const getActiveTabFromPath = (pathname) => {
    if (pathname.includes("homepage-banner")) return "banners";
    if (
      pathname.includes("machine-queries") ||
      pathname.includes("product-enquiries") ||
      pathname.includes("enquiries")
    )
      return "product-enquiries";
    if (pathname.includes("machine-content")) return "machines";
    if (pathname.includes("testimonials")) return "testimonials";
    if (pathname.includes("faq")) return "faqs";
    if (pathname.includes("clients")) return "clients";
    if (pathname.includes("blogs")) return "blogs";
    if (pathname.includes("newsletter")) return "newsletter";
    if (pathname.includes("contact")) return "contact";
    return "machines";
  };

  const currentTab = activeTab || getActiveTabFromPath(location.pathname);

  const navItems = [
    /* Temporarily commented out Homepage Banners
    {
      id: "banners",
      path: "/dashboard/homepage-banner",
      label: "Homepage Banners",
      icon: <ViewCarouselOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Hero Slider CRUD",
      count: counts.banners,
    },
    */
    {
      id: "machines",
      path: "/dashboard/machine-content",
      label: "Healthcare Products",
      icon: <Inventory2OutlinedIcon style={{ fontSize: 22 }} />,
      description: "Healthcare Products CRUD",
      count: counts.products,
    },
    {
      id: "product-enquiries",
      path: "/dashboard/machine-queries",
      label: "Machine Queries",
      icon: <ShoppingCartOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Machine inquiry leads",
      count: counts.productEnquiries,
    },
    {
      id: "testimonials",
      path: "/dashboard/testimonials",
      label: "Testimonials",
      icon: <RateReviewOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Client reviews & quotes",
      count: counts.testimonials,
    },
    /* Temporarily commented out FAQ Section
    {
      id: "faqs",
      path: "/dashboard/faq",
      label: "FAQ Section",
      icon: <HelpOutlineOutlinedIcon style={{ fontSize: 22 }} />,
      description: "FAQ Q&A management",
      count: counts.faqs,
    },
    */
    {
      id: "clients",
      path: "/dashboard/clients",
      label: "Clients",
      icon: <GroupOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Client logos & partners",
      count: counts.clients,
    },
    {
      id: "blogs",
      path: "/dashboard/blogs",
      label: "Blogs",
      icon: <ArticleOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Editorial blog cards CRUD",
      count: counts.blogs,
    },
    /* Temporarily commented out Newsletter menu item
    {
      id: "newsletter",
      path: "/dashboard/newsletter",
      label: "Newsletter",
      icon: <MarkEmailReadOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Newsletter editions CRUD",
      count: counts.newsletters,
    },
    */
    {
      id: "contact",
      path: "/dashboard/contact-us",
      label: "Contact Us Queries",
      icon: <ContactPhoneOutlinedIcon style={{ fontSize: 22 }} />,
      description: "Client queries & date bookings",
      count: counts.contacts,
    },
  ];

  const getTabTitle = (tabKey = currentTab) => {
    switch (tabKey) {
      case "machines":
        return "Healthcare Products";
      case "product-enquiries":
        return "Machine Queries";
      case "testimonials":
        return "Testimonials";
      case "faqs":
        return "FAQ Questions & Answers Management";
      case "clients":
        return "Clients";
      case "blogs":
        return "Blogs";
      case "newsletter":
        return "Newsletter Management";
      case "contact":
        return "Contact Us Queries";
      case "banners":
      default:
        return "Homepage Banner Management";
    }
  };

  const getTabBreadcrumb = (tabKey = currentTab) => {
    switch (tabKey) {
      case "machines":
        return "Healthcare Products";
      case "product-enquiries":
        return "Machine Queries";
      case "testimonials":
        return "Testimonials";
      case "faqs":
        return "FAQ";
      case "clients":
        return "Clients";
      case "blogs":
        return "Blogs";
      case "newsletter":
        return "Newsletter";
      case "contact":
        return "Contact Us Queries";
      case "banners":
      default:
        return "Homepage Banner";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR (Light Theme) ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-xl shadow-slate-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary-dark/15 p-1.5 shadow-xs">
              <img
                src={logo}
                alt="RHS Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  RHS Portal
                </span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary-dark">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Content Management
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <CloseOutlinedIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Content Controls
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                currentTab === item.id ||
                location.pathname === item.path ||
                (item.id === "banners" && location.pathname.includes("homepage-banner")) ||
                (item.id === "machines" && location.pathname.includes("machine-content")) ||
                (item.id === "product-enquiries" && (location.pathname.includes("machine-queries") || location.pathname.includes("product-enquiries") || location.pathname.includes("enquiries"))) ||
                (item.id === "testimonials" && location.pathname.includes("testimonials")) ||
                (item.id === "faqs" && location.pathname.includes("faq")) ||
                (item.id === "clients" && location.pathname.includes("clients")) ||
                (item.id === "blogs" && location.pathname.includes("blogs")) ||
                (item.id === "newsletter" && location.pathname.includes("newsletter")) ||
                (item.id === "contact" && location.pathname.includes("contact"));

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (setActiveTab) setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-primary-dark/10 text-primary-dark shadow-xs border border-primary/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-primary-dark"
                        : "text-slate-400 group-hover:text-primary"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="block truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary-dark"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                    <span
                      className={`block truncate text-[11px] font-normal ${
                        isActive ? "text-primary-dark/80" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button in Sidebar Bottom */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-rose-600 shadow-2xs transition-all hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 cursor-pointer"
          >
            <LogoutOutlinedIcon
              className="text-rose-500"
              style={{ fontSize: 18 }}
            />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA  */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 shrink-0 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-md sm:px-8 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <MenuOutlinedIcon style={{ fontSize: 22 }} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">
                  RHS Healthcare Portal
                </span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500">
                  {getTabBreadcrumb()}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl tracking-tight">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/80">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldOutlinedIcon style={{ fontSize: 16 }} />
              </div>
              <div className="hidden text-left md:block">
                <p className="text-[11px] font-bold text-slate-800 leading-none">
                  Admin Live Mode
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Real-time Storage Synced
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full">{children || <Outlet />}</div>
        </main>
      </div>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-inner">
              <LogoutOutlinedIcon style={{ fontSize: 28 }} />
            </div>
            <h3 className="text-center text-lg font-bold text-slate-900">
              Sign Out of Admin Portal?
            </h3>
            <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">
              Your modifications are safely saved in browser storage. You will
              need to enter administrator credentials to log in again.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
              >
                {isLoggingOut ? "Signing Out..." : "Yes, Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
