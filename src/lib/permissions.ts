export type CurrentUser = {
  id?: string;
  email?: string;
  fullName?: string;
  full_name?: string;
  roles?: {
    code: string;
    name?: string;
  }[];
  permissions?: string[];
};

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  try {
    const rawUser =
      localStorage.getItem("user") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="))
        ?.split("=")[1];

    if (!rawUser) return null;

    return JSON.parse(decodeURIComponent(rawUser));
  } catch {
    return null;
  }
}

export function hasPermission(permissionCode: string) {
  const user = getCurrentUser();

  if (!user) return false;

  const roleCode = user.roles?.[0]?.code;

  if (roleCode === "SUPER_ADMIN") return true;

  return user.permissions?.includes(permissionCode) || false;
}

export function hasAnyPermission(permissionCodes: string[]) {
  return permissionCodes.some((code) => hasPermission(code));
}