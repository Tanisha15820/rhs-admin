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
 * Fetch all products or filter by status ('all', 'active', 'inactive')
 * Endpoint: GET /api/products?status=<status>
 */
export async function fetchProducts(status = "all") {
  const base = getBaseApiUrl();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${base}/products${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch products (${response.status})`);
  }

  return Array.isArray(data.products) ? data.products : [];
}

/**
 * Fetch a single product by ID
 * Endpoint: GET /api/products/:id
 */
export async function fetchProductById(id) {
  const base = getBaseApiUrl();
  const response = await fetch(`${base}/products/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch product details (${response.status})`);
  }

  return data.product;
}

/**
 * Upload a product image to Cloudinary via backend
 * Endpoint: POST /api/products/upload-image
 * Uses multipart/form-data with field name 'image'
 */
export async function uploadProductImage(file) {
  if (!file) {
    throw new Error("Please select an image file to upload.");
  }

  const base = getBaseApiUrl();
  const formData = new FormData();
  formData.append("image", file);

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${base}/products/upload-image`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload product image.");
  }

  return {
    image_url: data.image_url,
    cloudinary_public_id: data.cloudinary_public_id,
  };
}

/**
 * Create a new product in the database
 * Endpoint: POST /api/products
 */
export async function createProduct({
  name,
  color_palette,
  image_url,
  cloudinary_public_id,
  is_active = true,
}) {
  const base = getBaseApiUrl();
  const response = await fetch(`${base}/products`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name?.trim(),
      color_palette,
      image_url,
      cloudinary_public_id,
      is_active: Boolean(is_active),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to create healthcare product.");
  }

  return data.product;
}

/**
 * Update an existing product in the database
 * Endpoint: PUT /api/products/:id
 */
export async function updateProduct(
  id,
  { name, color_palette, image_url, cloudinary_public_id, is_active }
) {
  const base = getBaseApiUrl();
  const response = await fetch(`${base}/products/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name?.trim(),
      color_palette,
      image_url,
      cloudinary_public_id,
      is_active: Boolean(is_active),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to update healthcare product.");
  }

  return data.product;
}

/**
 * Soft delete a product
 * Endpoint: DELETE /api/products/:id
 */
export async function deleteProduct(id) {
  const base = getBaseApiUrl();
  const response = await fetch(`${base}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete healthcare product.");
  }

  return data;
}
