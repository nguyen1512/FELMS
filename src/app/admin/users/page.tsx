"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import { hasPermission } from "@/lib/permissions";

import {
  Edit3,
  Eye,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Unlock,
  UserCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type UserItem = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  status: string;
  department_id?: string | null;
  department_name?: string | null;
  role_code?: string | null;
  role_name?: string | null;
};

type DepartmentItem = {
  id: string;
  name: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

function getToken() {
  return localStorage.getItem("token") || getCookie("token");
}

function getStatusLabel(status: string) {
  if (status === "active") return "Đang hoạt động";
  if (status === "locked") return "Đang khóa";

  return status;
}

function getStatusClass(status: string) {
  return status === "active"
    ? "bg-green-100 text-green-700 border border-green-200"
    : "bg-red-100 text-red-700 border border-red-200";
}

function getRoleClass(roleCode?: string | null) {
  if (roleCode === "SUPER_ADMIN") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (roleCode === "LMS_ADMIN") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function getRoleLabel(roleCode?: string | null) {
  if (roleCode === "SUPER_ADMIN") return "Admin hệ thống";
  if (roleCode === "LMS_ADMIN") return "Quản trị LMS";
  if (roleCode === "EMPLOYEE") return "Nhân viên";

  return roleCode || "Chưa có";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [departmentId, setDepartmentId] = useState("");
  const [roleCode, setRoleCode] = useState("EMPLOYEE");

  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const canCreateUser = hasPermission("users.create");
  const canUpdateUser = hasPermission("users.update");
  const canLockUser = hasPermission("users.lock");

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      locked: users.filter((u) => u.status === "locked").length,
      admin: users.filter(
        (u) =>
          u.role_code === "SUPER_ADMIN" ||
          u.role_code === "LMS_ADMIN"
      ).length,
    };
  }, [users]);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được user");
      }

      setUsers(data.users || []);
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được danh sách user"
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchDepartments() {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được phòng ban");
      }

      setDepartments(data.departments || []);
    } catch (error) {
      console.error(error);
    }
  }

  function resetForm() {
    setEditingUser(null);

    setFullName("");
    setEmail("");
    setPassword("Admin@123");
    setDepartmentId("");
    setRoleCode("EMPLOYEE");
  }

  function handleEditUser(user: UserItem) {
    if (!canUpdateUser) return;

    setEditingUser(user);

    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setPassword("");
    setDepartmentId(user.department_id || "");
    setRoleCode(user.role_code || "EMPLOYEE");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleCreateUser() {
    if (!canCreateUser) {
      setMessageType("error");
      setMessage("Bạn không có quyền tạo tài khoản.");
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          department_id: departmentId || null,
          role_code: roleCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo tài khoản thất bại");
      }

      setMessageType("success");
      setMessage("Tạo tài khoản thành công");

      resetForm();

      await fetchUsers();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Tạo tài khoản thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateUser() {
    if (!editingUser) return;

    if (!canUpdateUser) {
      setMessageType("error");
      setMessage("Bạn không có quyền cập nhật tài khoản.");
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${editingUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password: password || undefined,
            department_id: departmentId || null,
            role_code: roleCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cập nhật thất bại");
      }

      setMessageType("success");
      setMessage("Cập nhật tài khoản thành công");

      resetForm();

      await fetchUsers();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Cập nhật thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingUser) {
      await handleUpdateUser();
      return;
    }

    await handleCreateUser();
  }

  async function handleToggleStatus(user: UserItem) {
    if (!canLockUser) {
      setMessageType("error");
      setMessage("Bạn không có quyền khóa tài khoản.");
      return;
    }

    try {
      setUpdatingId(user.id);

      const token = getToken();

      const nextStatus =
        user.status === "active" ? "locked" : "active";

      const response = await fetch(
        `${API_URL}/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Cập nhật trạng thái thất bại"
        );
      }

      await fetchUsers();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Cập nhật trạng thái thất bại"
      );
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  return (
    <AppShell workspace="admin" title="Quản lý tài khoản">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            User Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Quản lý tài khoản hệ thống
          </h1>

          <p className="mt-2 text-slate-500">
            Quản lý tài khoản đăng nhập, phân quyền và trạng thái
            hoạt động.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>

            <p className="text-sm text-slate-500">
              Tổng tài khoản
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCheck className="text-green-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.active}
            </p>

            <p className="text-sm text-slate-500">
              Đang hoạt động
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.admin}
            </p>

            <p className="text-sm text-slate-500">
              Tài khoản quản trị
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserRoundX className="text-red-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.locked}
            </p>

            <p className="text-sm text-slate-500">
              Đang khóa
            </p>
          </div>
        </section>

        {(canCreateUser || canUpdateUser) && (
          <SectionCard
            title={
              editingUser
                ? "Cập nhật tài khoản"
                : "Tạo tài khoản mới"
            }
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {editingUser && (
                <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <div>
                    <p className="font-bold text-orange-700">
                      Đang sửa: {editingUser.full_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {editingUser.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-orange-200 bg-white p-2 text-orange-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                required
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                required
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={
                  editingUser
                    ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)"
                    : "Mật khẩu"
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                required={!editingUser}
              />

              <select
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Chọn phòng ban</option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              <select
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="SUPER_ADMIN">
                  Admin hệ thống
                </option>

                <option value="LMS_ADMIN">
                  Quản trị LMS
                </option>

                <option value="EMPLOYEE">
                  Nhân viên
                </option>
              </select>

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    messageType === "success"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  (editingUser
                    ? !canUpdateUser
                    : !canCreateUser)
                }
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Plus size={18} />

                {submitting
                  ? editingUser
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : editingUser
                  ? "Cập nhật tài khoản"
                  : "Tạo tài khoản"}
              </button>
            </form>
          </SectionCard>
        )}

        <SectionCard title="Danh sách tài khoản">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4 text-center">
                    Vai trò
                  </th>
                  <th className="p-4 text-center">
                    Trạng thái
                  </th>
                  <th className="p-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-4">
                      <p className="font-bold text-slate-950">
                        {user.full_name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="p-4 text-slate-600">
                      {user.department_name || "Chưa có"}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                          user.role_code
                        )}`}
                      >
                        {getRoleLabel(user.role_code)}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                          <Eye size={16} />
                        </button>

                        {canUpdateUser && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEditUser(user)
                            }
                            className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {canLockUser && (
                          <button
                            type="button"
                            disabled={updatingId === user.id}
                            onClick={() =>
                              handleToggleStatus(user)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {user.status === "active" ? (
                              <Lock size={16} />
                            ) : (
                              <Unlock size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && !loadingUsers && (
                  <tr>
                    <td
                      className="p-6 text-center text-slate-500"
                      colSpan={5}
                    >
                      Chưa có tài khoản nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}