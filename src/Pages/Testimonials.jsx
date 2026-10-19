import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import TestimonialsTab from "../Components/DashboardTabs/TestimonialsTab";
import SEO from "../Components/SEO";
import { getAllTestimonials } from "../utils/testimonialStorage";

/**
 * Testimonials Page
 * Route: /dashboard/testimonials (or /admin/testimonials)
 * Dedicated page for managing doctor and hospital reviews and testimonials.
 */
function Testimonials({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localTestimonials, setLocalTestimonials] = useState(() => getAllTestimonials());

  const testimonials = context.testimonials ?? localTestimonials;
  const setTestimonials = context.setTestimonials ?? setLocalTestimonials;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalTestimonials(getAllTestimonials());
    };
    window.addEventListener("rhs_testimonials_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_testimonials_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="Homepage Testimonials Management | Reinforce Healthcare Services"
        description="Add, edit, and manage doctor and hospital reviews, quotes, and star ratings."
      />
      <TestimonialsTab
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        showNotify={showNotify}
      />
    </>
  );
}

export default Testimonials;
