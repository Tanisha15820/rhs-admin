import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ClientsTab from "../Components/DashboardTabs/ClientsTab";
import SEO from "../Components/SEO";
import { getAllClients } from "../utils/clientStorage";

/**
 * Clients Page
 * Route: /dashboard/clients (or /admin/clients)
 * Dedicated page for managing client logos and hospital partner associations.
 */
function Clients({ showNotify: propNotify }) {
  const context = useOutletContext() || {};
  const [localClients, setLocalClients] = useState(() => getAllClients());

  const clients = context.clients ?? localClients;
  const setClients = context.setClients ?? setLocalClients;
  const showNotify = context.showNotify ?? propNotify ?? (() => {});

  // Sync with localStorage updates if rendered standalone
  useEffect(() => {
    const handleUpdate = () => {
      setLocalClients(getAllClients());
    };
    window.addEventListener("rhs_clients_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rhs_clients_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <SEO
        title="Client Logos & Partners Management | Reinforce Healthcare Services"
        description="Manage hospital partners, clinics, and healthcare client logos."
      />
      <ClientsTab
        clients={clients}
        setClients={setClients}
        showNotify={showNotify}
      />
    </>
  );
}

export default Clients;
