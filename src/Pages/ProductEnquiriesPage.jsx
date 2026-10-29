import { useOutletContext } from "react-router-dom";
import ProductEnquiriesTab from "../Components/DashboardTabs/ProductEnquiriesTab";
import SEO from "../Components/SEO";

/**
 * ProductEnquiriesPage (Machine Queries Page)
 * Routes: /dashboard/machine-queries, /dashboard/product-enquiries
 * Dedicated admin page for viewing and filtering machine inquiries submitted from the RHS website.
 */
function ProductEnquiriesPage({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  return (
    <>
      <SEO
        title="Machine Queries | Reinforce Healthcare Services Admin"
        description="View and filter incoming medical machine queries submitted through the RHS website."
      />
      <ProductEnquiriesTab showNotify={showNotify} />
    </>
  );
}

export default ProductEnquiriesPage;
