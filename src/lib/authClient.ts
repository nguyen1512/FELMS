function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");

    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return "";
}

export function getTokenFromLocalStorage() {
  if (typeof window === "undefined") return "";

  const cookieToken = getCookie("token");

  if (cookieToken && cookieToken !== "undefined" && cookieToken !== "null") {
    return cookieToken.replace(/^Bearer\s+/i, "");
  }

  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "lms_token",
    "anu_lms_token",
    "adminToken",
    "jwt",
    "auth_token",
    "access_token",
    "userToken",
    "admin_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value && value !== "undefined" && value !== "null") {
      return value.replace(/^Bearer\s+/i, "");
    }
  }

  return "";
}

export function getAuthHeaders(): HeadersInit {
  const token = getTokenFromLocalStorage();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function clearAuthClient() {
  if (typeof window === "undefined") return;

  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "user=; Max-Age=0; path=/";
  document.cookie = "auth_raw=; Max-Age=0; path=/";

  [
    "token",
    "accessToken",
    "authToken",
    "lms_token",
    "anu_lms_token",
    "adminToken",
    "jwt",
    "auth_token",
    "access_token",
    "userToken",
    "admin_token",
    "user",
    "auth",
    "authUser",
    "currentUser",
    "lms_user",
    "admin",
    "adminUser",
    "loginUser",
    "userInfo",
    "auth_raw",
  ].forEach((key) => localStorage.removeItem(key));
}