import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import MachinesTab from "../Components/DashboardTabs/MachinesTab";
import SEO from "../Components/SEO";

/**
 * MachineContent Page
 * Route: /dashboard/machine-content (or /admin/machine-content)
 * Dedicated page for managing healthcare product catalog via backend API.
 */
function MachineContent({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Remove obsolete localStorage key if present
  useEffect(() => {
    try {
      localStorage.removeItem("rhs_machine_products_v1");
    } catch {}
  }, []);

  return (
    <>
      <SEO
        title="Healthcare Products | Reinforce Healthcare Services"
        description="Manage healthcare products catalog images, features, descriptions, and rental information."
      />
      <MachinesTab
        showNotify={showNotify}
        onProductsChanged={context.reloadProducts}
      />
    </>
  );
}

export default MachineContent;
