const AUTH_STORAGE_KEY = "rhs_admin_auth";

export const DEFAULT_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export const isAuthenticated = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session && session.isLoggedIn);
  } catch (e) {
    console.error("Auth check error:", e);
    return false;
  }
};

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const login = (username, password) => {
  const trimmedUser = (username || "").trim();
  const trimmedPass = (password || "").trim();

  if (!trimmedUser || !trimmedPass) {
    return { success: false, message: "Please enter both username and password." };
  }

  if (
    trimmedUser.toLowerCase() === DEFAULT_CREDENTIALS.username.toLowerCase() &&
    trimmedPass === DEFAULT_CREDENTIALS.password
  ) {
    const sessionData = {
      isLoggedIn: true,
      username: DEFAULT_CREDENTIALS.username,
      name: "RHS Administrator",
      role: "Super Admin",
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event("rhs_auth_changed"));
    return { success: true };
  }

  return { success: false, message: "Invalid username or password. Please try again." };
};

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("rhs_auth_changed"));
};