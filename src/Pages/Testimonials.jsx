import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import TestimonialsTab from "../Components/DashboardTabs/TestimonialsTab";
import SEO from "../Components/SEO";
import { clearLegacyTestimonialsStorage } from "../utils/testimonialStorage";

/**
 * Testimonials Page
 * Route: /dashboard/testimonials (or /admin/testimonials)
 * Dedicated page for managing doctor and client reviews and testimonials.
 */
function Testimonials({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Remove obsolete localStorage key if present
  useEffect(() => {
    clearLegacyTestimonialsStorage();
  }, []);

  return (
    <>
      <SEO
        title="Testimonials | Reinforce Healthcare Services"
        description="Add, edit, and manage doctor and hospital reviews, quotes, and star ratings."
      />
      <TestimonialsTab
        showNotify={showNotify}
        onTestimonialsChanged={context.reloadTestimonials}
      />
    </>
  );
}

export default Testimonials;
