export type UserRole = {
  role_code: string;
  role_name: string;
};

export type UserPermission = {
  permission_code: string;
  module: string;
  action: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  position?: string;
  status?: string;
  roles: UserRole[];
  permissions: UserPermission[];
};

export type LoginPayload = {
  email: string;
  password: string;
};