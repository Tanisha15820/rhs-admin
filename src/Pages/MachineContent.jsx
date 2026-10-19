import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import MachinesTab from "../Components/DashboardTabs/MachinesTab";
import SEO from "../Components/SEO";
import { getMachineProducts } from "../utils/machineStorage";

/**
 * MachineContent Page
 * Route: /dashboard/machine-content (or /admin/machine-content)
 * Dedicated page for managing medical machinery images, specs, and details.
 */
function MachineContent({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localProducts, setLocalProducts] = useState(() => getMachineProducts());

  const products = context.products ?? localProducts;
  const setProducts = context.setProducts ?? setLocalProducts;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalProducts(getMachineProducts());
    };
    window.addEventListener("rhs_machine_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_machine_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="Machine Image & Content Management | Reinforce Healthcare Services"
        description="Manage medical machinery catalog images, features, descriptions, and rental information."
      />
      <MachinesTab
        products={products}
        setProducts={setProducts}
        showNotify={showNotify}
      />
    </>
  );
}

export default MachineContent;
