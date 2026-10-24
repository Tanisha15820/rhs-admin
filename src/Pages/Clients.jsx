import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ClientsTab from "../Components/DashboardTabs/ClientsTab";
import SEO from "../Components/SEO";
import { clearLegacyClientsStorage } from "../utils/clientStorage";

/**
 * Clients Page
 * Route: /dashboard/clients (or /admin/clients)
 * Dedicated page for managing client logos and hospital partner associations.
 */
function Clients({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Remove obsolete localStorage key if present
  useEffect(() => {
    clearLegacyClientsStorage();
  }, []);

  return (
    <>
      <SEO
        title="Clients | Reinforce Healthcare Services"
        description="Manage hospital partners, clinics, and healthcare client logos."
      />
      <ClientsTab
        showNotify={showNotify}
        onClientsChanged={context.reloadClients}
      />
    </>
  );
}

export default Clients;
