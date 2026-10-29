import { useOutletContext } from "react-router-dom";
import NewsletterTab from "../Components/DashboardTabs/NewsletterTab";
import SEO from "../Components/SEO";

/**
 * Newsletter Page
 * Route: /dashboard/newsletter (or /admin/newsletter)
 * Dedicated admin page for managing healthcare equipment rental newsletter editions.
 */
function NewsletterPage({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  return (
    <>
      <SEO
        title="Newsletter | Reinforce Healthcare Services"
        description="Manage hospital medical equipment rental newsletters, dispatches, and editions."
      />
      <NewsletterTab
        showNotify={showNotify}
        onNewslettersChanged={context.reloadNewsletters}
      />
    </>
  );
}

export default NewsletterPage;
