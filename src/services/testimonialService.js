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
 * 1. Upload a testimonial photo to Cloudinary via backend
 * Endpoint: POST /api/testimonials/upload-image
 * Uses multipart/form-data with field name 'image'
 */
export async function uploadTestimonialImage(file) {
  if (!file) {
    throw new Error("Please select an image file to upload.");
  }

  const base = getBaseApiUrl();
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(`${base}/testimonials/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      image_url: response.data.image_url,
      cloudinary_public_id: response.data.cloudinary_public_id,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to upload testimonial image.");
  }
}

/**
 * 2. Create a new testimonial in the database
 * Endpoint: POST /api/testimonials
 */
export async function createTestimonial({
  author_name,
  quote,
  bg_theme = "lavender",
  image_url = null,
  cloudinary_public_id = null,
  is_active = true,
}) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.post(
      `${base}/testimonials`,
      {
        author_name: author_name?.trim(),
        quote: quote?.trim(),
        bg_theme,
        image_url: image_url || null,
        cloudinary_public_id: cloudinary_public_id || null,
        is_active: Boolean(is_active),
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.testimonial;
  } catch (error) {
    return handleAxiosError(error, "Failed to create testimonial.");
  }
}

/**
 * 3. Fetch all testimonials for admin (status = "all", "active", "inactive")
 * Endpoint: GET /api/testimonials?status=<status>
 */
export async function fetchTestimonials(status = "all") {
  const base = getBaseApiUrl();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const response = await axios.get(`${base}/testimonials${query}`, {
      headers: getAuthHeaders(),
    });

    return Array.isArray(response.data?.testimonials)
      ? response.data.testimonials
      : [];
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch testimonials.");
  }
}

/**
 * 4. Fetch a single testimonial by ID
 * Endpoint: GET /api/testimonials/:id
 */
export async function fetchTestimonialById(id) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.get(`${base}/testimonials/${id}`, {
      headers: getAuthHeaders(),
    });

    return response.data.testimonial;
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch testimonial details.");
  }
}

/**
 * 5. Update an existing testimonial in the database
 * Endpoint: PUT /api/testimonials/:id
 */
export async function updateTestimonial(
  id,
  {
    author_name,
    quote,
    bg_theme,
    image_url,
    cloudinary_public_id,
    is_active,
  }
) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.put(
      `${base}/testimonials/${id}`,
      {
        author_name: author_name?.trim(),
        quote: quote?.trim(),
        bg_theme,
        image_url: image_url || null,
        cloudinary_public_id: cloudinary_public_id || null,
        is_active: Boolean(is_active),
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.testimonial;
  } catch (error) {
    return handleAxiosError(error, "Failed to update testimonial.");
  }
}

/**
 * 6. Soft delete a testimonial
 * Endpoint: DELETE /api/testimonials/:id
 */
export async function deleteTestimonial(id) {
  const base = getBaseApiUrl();
  try {
    const response = await axios.delete(`${base}/testimonials/${id}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    return handleAxiosError(error, "Failed to delete testimonial.");
  }
}
