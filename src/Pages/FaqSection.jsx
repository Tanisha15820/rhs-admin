import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import FaqsTab from "../Components/DashboardTabs/FaqsTab";
import SEO from "../Components/SEO";
import { getAllFaqs } from "../utils/faqStorage";

/**
 * FaqSection Page
 * Route: /dashboard/faq (or /admin/faq)
 * Dedicated page for managing FAQs and answers.
 */
function FaqSection({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localFaqs, setLocalFaqs] = useState(() => getAllFaqs());

  const faqs = context.faqs ?? localFaqs;
  const setFaqs = context.setFaqs ?? setLocalFaqs;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalFaqs(getAllFaqs());
    };
    window.addEventListener("rhs_faqs_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_faqs_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="FAQ Questions & Answers Management | Reinforce Healthcare Services"
        description="Manage frequently asked questions, detailed answers, and categories for hospital equipment rental."
      />
      {/* Temporarily commented out
      <FaqsTab
        faqs={faqs}
        setFaqs={setFaqs}
        showNotify={showNotify}
      />
      */}
    </>
  );
}

export default FaqSection;
