import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { getBaseApiUrl } from "../config/env";

export const ENQUIRY_STATUS_OPTIONS = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
];

/**
 * Helper to get default authorization headers with the current admin JWT
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Candidate base API URLs so Admin Panel works across localhost, 127.0.0.1, and LAN IPs
 */
const getCandidateBaseUrls = () => {
  const base = getBaseApiUrl();
  const host =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "localhost";

  return Array.from(
    new Set([
      "/api",
      base,
      `http://${host}:5000/api`,
      "http://localhost:5000/api",
    ])
  );
};

/**
 * Helper to extract descriptive error messages from Axios responses
 */
const handleAxiosError = (error, defaultMessage) => {
  const backendMsg = error?.response?.data?.message;
  const message = backendMsg || error?.message || defaultMessage;
  const err = new Error(message);
  err.response = error?.response;
  throw err;
};

/**
 * Normalize an enquiry record from the backend (`dbo.machine_queries` table)
 */
const normalizeEnquiryRecord = (row) => {
  const parsedProducts =
    Array.isArray(row.products) && row.products.length > 0
      ? row.products
      : row.machine_name
      ? [
          {
            id: row.machine_id || 1,
            name: row.machine_name,
            quantity: 1,
            image: "",
          },
        ]
      : [];

  return {
    id: row.id,
    machine_id: row.machine_id || "",
    machine_name: row.machine_name || "Medical Equipment",
    products: parsedProducts,
    hospital: row.hospital || "",
    name: row.name || row.user_name || "",
    user_name: row.user_name || row.name || "",
    email: row.email || row.user_email || "",
    user_email: row.user_email || row.email || "",
    contact: row.contact || row.user_phone || "",
    user_phone: row.user_phone || row.contact || "",
    address: row.address || "",
    country: row.country || "INDIA",
    state: row.state || "",
    city: row.city || "",
    pinCode: row.pinCode || row.pin_code || "",
    pin_code: row.pin_code || row.pinCode || "",
    details: row.details || row.query_reason || row.message || "",
    query_reason: row.query_reason || row.details || row.message || "",
    message: row.message || row.query_reason || row.details || "",
    status: row.status || "New",
    adminNotes: row.adminNotes || row.admin_notes || "",
    admin_notes: row.admin_notes || row.adminNotes || "",
    created_at: row.created_at || row.submittedAt || null,
    submittedAt: row.submittedAt || row.created_at || null,
  };
};

/**
 * Fetch all product/machine enquiries from GET /api/product-enquiries
 * Supports optional filtering by machine_name, status, and search query.
 */
export async function fetchMachineQueries({
  machineName = "All",
  status = "All",
  search = "",
} = {}) {
  const params = {};

  if (machineName && machineName !== "All") {
    params.machine_name = machineName;
  }
  if (status && status !== "All" && status !== "all") {
    params.status = status;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }

  let lastError = null;
  for (const base of getCandidateBaseUrls()) {
    try {
      const response = await axios.get(`${base}/product-enquiries`, {
        headers: getAuthHeaders(),
        params,
      });

      const data = response.data || {};
      const rawList = Array.isArray(data.enquiries)
        ? data.enquiries
        : Array.isArray(data.queries)
        ? data.queries
        : Array.isArray(data)
        ? data
        : [];

      const enquiries = rawList.map(normalizeEnquiryRecord);
      const machineNames = Array.isArray(data.machineNames)
        ? data.machineNames
        : Array.from(
            new Set(enquiries.map((q) => q.machine_name).filter(Boolean))
          ).sort();

      return {
        data: enquiries,
        enquiries,
        queries: enquiries,
        machineNames,
        total: typeof data.total === "number" ? data.total : enquiries.length,
        isLiveBackend: true,
      };
    } catch (error) {
      lastError = error;
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        break;
      }
    }
  }

  return handleAxiosError(
    lastError,
    "Failed to fetch product enquiries from the server."
  );
}

/**
 * Fetch all product enquiries or filter by status
 * Endpoint: GET /api/product-enquiries
 */
export async function fetchProductEnquiries(status = "All") {
  return fetchMachineQueries({ status });
}

/**
 * Update the processing status of a product/machine enquiry
 * Endpoint: PATCH /api/product-enquiries/:id/status
 */
export async function updateProductEnquiryStatus(id, newStatus) {
  let lastError = null;
  for (const base of getCandidateBaseUrls()) {
    try {
      const response = await axios.patch(
        `${base}/product-enquiries/${id}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      const updated =
        response.data?.enquiry || response.data?.query || response.data;
      return {
        success: true,
        enquiry: updated ? normalizeEnquiryRecord(updated) : null,
        isLiveBackend: true,
      };
    } catch (error) {
      lastError = error;
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        break;
      }
    }
  }

  return handleAxiosError(lastError, "Failed to update enquiry status.");
}

/**
 * Update internal admin remarks / notes for a product/machine enquiry
 * Endpoint: PATCH /api/product-enquiries/:id/notes
 */
export async function updateProductEnquiryNotes(id, adminNotes) {
  let lastError = null;
  for (const base of getCandidateBaseUrls()) {
    try {
      const response = await axios.patch(
        `${base}/product-enquiries/${id}/notes`,
        { adminNotes },
        { headers: getAuthHeaders() }
      );

      const updated =
        response.data?.enquiry || response.data?.query || response.data;
      return {
        success: true,
        enquiry: updated ? normalizeEnquiryRecord(updated) : null,
        isLiveBackend: true,
      };
    } catch (error) {
      lastError = error;
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        break;
      }
    }
  }

  return handleAxiosError(lastError, "Failed to save admin notes.");
}
