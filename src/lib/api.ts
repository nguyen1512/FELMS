const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export function apiUrl(path: string) {
  let cleanPath = path.trim();

  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  // Nếu .env đã có /api mà path cũng truyền /api/... thì bỏ bớt 1 /api
  if (API_BASE_URL.endsWith("/api") && cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  // Nếu .env không có /api mà path chưa có api/ thì tự thêm
  if (!API_BASE_URL.endsWith("/api") && !cleanPath.startsWith("api/")) {
    cleanPath = `api/${cleanPath}`;
  }

  return `${API_BASE_URL}/${cleanPath}`;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "GET",
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("API không trả về đúng định dạng JSON");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "Lỗi khi gọi API");
  }

  return result as T;
}

export async function apiPost<T = any>(
  path: string,
  body?: any
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("API không trả về đúng định dạng JSON");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "Lỗi khi gọi API");
  }

  return result as T;
}

export async function apiPut<T = any>(
  path: string,
  body?: any
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("API không trả về đúng định dạng JSON");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "Lỗi khi gọi API");
  }

  return result as T;
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "DELETE",
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("API không trả về đúng định dạng JSON");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "Lỗi khi gọi API");
  }

  return result as T;
}