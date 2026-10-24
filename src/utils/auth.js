const TOKEN_KEY = "rhs_admin_token";
const USER_KEY = "rhs_admin_user";

/**
 * Retrieve the active admin session JWT token
 */
export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

/**
 * Check whether the current admin session is authenticated
 */
export const isAuthenticated = () => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return Boolean(token);
  } catch (e) {
    console.error("Auth check error:", e);
    return false;
  }
};

/**
 * Get the currently logged-in administrator profile details
 */
export const getAdminUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Authenticate against the backend authentication API: POST /api/auth/login
 *
 * @param {string} username - Administrator username
 * @param {string} password - Administrator password
 * @returns {Promise<{ success: boolean, message?: string, token?: string, admin?: object }>}
 */
export const login = async (username, password) => {
  const trimmedUser = (username || "").trim();

  if (!trimmedUser || !password) {
    return {
      success: false,
      message: "Please enter both username and password.",
    };
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: trimmedUser,
        password: password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Invalid username or password.",
      };
    }

    if (data.token) {
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(
        USER_KEY,
        JSON.stringify({
          id: data.admin?.id,
          username: data.admin?.username || trimmedUser,
          name: data.admin?.username === "admin" ? "RHS Administrator" : data.admin?.username,
          role: "Super Admin",
        })
      );
    }

    // Clean up any legacy localStorage entry from old mock implementation
    try {
      localStorage.removeItem("rhs_admin_auth");
    } catch {}

    window.dispatchEvent(new Event("rhs_auth_changed"));

    return {
      success: true,
      message: data.message || "Login successful",
      token: data.token,
      admin: data.admin,
    };
  } catch (error) {
    console.error("Login API request failed:", error);
    return {
      success: false,
      message: "Unable to connect to login server. Please verify backend is running on port 5000.",
    };
  }
};

/**
 * Clear the current administrator session
 */
export const logout = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem("rhs_admin_auth");
  } catch (error) {
    console.error("Logout error:", error);
  }

  window.dispatchEvent(new Event("rhs_auth_changed"));
};