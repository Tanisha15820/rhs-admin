import axios from "axios";
import { getAuthToken } from "../utils/auth";

/**
 * Resolve the base API endpoint URL without duplicate /api prefixes
 */
const getBaseApiUrl = () => {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  if (!envUrl) return "/api";
  const clean = envUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${clean}/api`;
};

/**
 * Helper to get default authorization headers with the current admin JWT
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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
 * 1. Upload a client or partner logo to Cloudinary via backend
 * Endpoint: POST /api/clients/upload-image
 * Uses multipart/form-data with field name 'image'
 */
export async function uploadClientLogo(file) {
  if (!file) {
    throw new Error("Please select an image file to upload.");
  }

  const base = getBaseApiUrl();
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(`${base}/clients/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      logo_url: response.data.logo_url,
      cloudinary_public_id: response.data.cloudinary_public_id,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to upload client logo image.");
  }
}

/**
 * 2. Create a new client in the database
 * Endpoint: POST /api/clients
 */
export async function createClient({
  name,
  logo_url = null,
  cloudinary_public_id = null,
  bg_theme = "soft-blue",
  is_active = true,
  display_order = 0,
}) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.post(
      `${base}/clients`,
      {
        name: name?.trim(),
        logo_url: logo_url || null,
        cloudinary_public_id: cloudinary_public_id || null,
        bg_theme,
        is_active: Boolean(is_active),
        display_order: Number.isInteger(display_order) ? display_order : 0,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.client;
  } catch (error) {
    return handleAxiosError(error, "Failed to create client card.");
  }
}

/**
 * 3. Fetch all clients for admin (status = "all", "active", "inactive")
 * Endpoint: GET /api/clients?status=<status>
 */
export async function fetchClients(status = "all") {
  const base = getBaseApiUrl();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const response = await axios.get(`${base}/clients${query}`, {
      headers: getAuthHeaders(),
    });

    return Array.isArray(response.data?.clients) ? response.data.clients : [];
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch clients.");
  }
}

/**
 * 4. Fetch a single client by ID
 * Endpoint: GET /api/clients/:id
 */
export async function fetchClientById(id) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/clients/${id}`, {
      headers: getAuthHeaders(),
    });

    return response.data.client;
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch client details.");
  }
}

/**
 * 5. Update an existing client in the database
 * Endpoint: PUT /api/clients/:id
 */
export async function updateClient(
  id,
  { name, logo_url, cloudinary_public_id, bg_theme, is_active, display_order }
) {
  const base = getBaseApiUrl();
  try {
    const payload = {
      name: name?.trim(),
      bg_theme,
      is_active: Boolean(is_active),
      display_order: Number.isInteger(display_order) ? display_order : 0,
    };

    if (logo_url !== undefined) {
      payload.logo_url = logo_url;
    }
    if (cloudinary_public_id !== undefined) {
      payload.cloudinary_public_id = cloudinary_public_id;
    }

    const response = await axios.put(`${base}/clients/${id}`, payload, {
      headers: getAuthHeaders(),
    });

    return response.data.client;
  } catch (error) {
    return handleAxiosError(error, "Failed to update client card.");
  }
}

/**
 * 6. Soft delete a client
 * Endpoint: DELETE /api/clients/:id
 */
export async function deleteClient(id) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.delete(`${base}/clients/${id}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    return handleAxiosError(error, "Failed to delete client card.");
  }
}
