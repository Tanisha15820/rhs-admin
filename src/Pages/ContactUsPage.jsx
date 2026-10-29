import { useOutletContext } from "react-router-dom";
import ContactUsTab from "../Components/DashboardTabs/ContactUsTab";
import SEO from "../Components/SEO";

/**
 * ContactUsPage
 * Route: /dashboard/contact-us (or /admin/contact-us)
 * Dedicated admin page for managing RHS Contact Us enquiries,
 * hospital machine rental leads, and date-based call booking slot capacities.
 */
function ContactUsPage({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  return (
    <>
      <SEO
        title="Contact Enquiries & Call Bookings | Reinforce Healthcare Services Admin"
        description="Review doctor and hospital equipment inquiries, monitor date-based call booking capacities, and manage procurement leads."
      />
      <ContactUsTab showNotify={showNotify} />
    </>
  );
}

export default ContactUsPage;
