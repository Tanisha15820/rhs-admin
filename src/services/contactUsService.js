import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { getBaseApiUrl } from "../config/env";

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
 * 1. Fetch all contact queries for the Admin Dashboard
 * Endpoint: GET /api/contact-us/queries
 */
export async function fetchContactQueries({
  selected_date = "",
  status = "",
  search = "",
  page = "",
  limit = "",
} = {}) {
  const base = getBaseApiUrl();
  const params = {};

  if (selected_date && selected_date !== "All") {
    params.selected_date = selected_date;
  }
  if (status && status !== "All") {
    params.status = status;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  if (page) {
    params.page = page;
  }
  if (limit) {
    params.limit = limit;
  }

  try {
    const response = await axios.get(`${base}/contact-us/queries`, {
      headers: getAuthHeaders(),
      params,
    });

    return {
      queries: Array.isArray(response.data?.queries)
        ? response.data.queries
        : [],
      total: Number(response.data?.total ?? 0),
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch contact queries.");
  }
}

/**
 * 2. Update the status of a specific contact query
 * Endpoint: PATCH /api/contact-us/queries/:id/status
 */
export async function updateContactQueryStatus(id, status) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.patch(
      `${base}/contact-us/queries/${id}/status`,
      { status },
      { headers: getAuthHeaders() }
    );

    return response.data?.query || null;
  } catch (error) {
    return handleAxiosError(error, "Failed to update query status.");
  }
}

/**
 * 3. Fetch booked dates summary (dates with >= 50 queries and per-date counts)
 * Endpoint: GET /api/contact-us/booked-dates
 */
export async function fetchBookedDatesSummary() {
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/contact-us/booked-dates`, {
      headers: getAuthHeaders(),
    });

    return {
      bookedDates: Array.isArray(response.data?.bookedDates)
        ? response.data.bookedDates
        : [],
      dateCounts:
        response.data?.dateCounts && typeof response.data.dateCounts === "object"
          ? response.data.dateCounts
          : {},
      maxCapacity: Number(response.data?.maxCapacity) || 50,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch booked dates summary.");
  }
}

