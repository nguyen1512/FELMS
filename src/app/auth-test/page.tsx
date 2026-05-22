"use client";

import { useAuth } from "@/components/AuthProvider";

export default function AuthTestPage() {
  const { user, loading, isAuthenticated, hasRole, hasPermission, logout } =
    useAuth();

  if (loading) return <div>Đang kiểm tra đăng nhập...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Auth Test</h1>

      <p>Đã đăng nhập: {isAuthenticated ? "Có" : "Không"}</p>
      <p>Email: {user?.email}</p>
      <p>Role SUPER_ADMIN: {hasRole("SUPER_ADMIN") ? "Có" : "Không"}</p>
      <p>
        Quyền users.create:{" "}
        {hasPermission("users.create") ? "Có" : "Không"}
      </p>

      <button onClick={logout}>Đăng xuất</button>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}