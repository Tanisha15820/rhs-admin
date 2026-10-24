import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import BannersTab from "../Components/DashboardTabs/BannersTab";
import SEO from "../Components/SEO";
import { getAllBanners } from "../utils/bannerStorage";

/**
 * HomepageBanner Page
 * Route: /dashboard/homepage-banner (or /admin/homepage-banner)
 * Dedicated page for managing hero slider banners.
 */
function HomepageBanner({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localBanners, setLocalBanners] = useState(() => getAllBanners());

  const banners = context.banners ?? localBanners;
  const setBanners = context.setBanners ?? setLocalBanners;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalBanners(getAllBanners());
    };
    window.addEventListener("rhs_banner_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_banner_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="Homepage Banner Management | Reinforce Healthcare Services"
        description="Comprehensive dashboard to add, edit, and organize homepage hero banners and slider content."
      />
      {/* Temporarily commented out
      <BannersTab
        banners={banners}
        setBanners={setBanners}
        showNotify={showNotify}
      />
      */}
    </>
  );
}

export default HomepageBanner;
