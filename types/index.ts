export type PermissionStatus = "pending" | "approved" | "out" | "returned" | "rejected";

export interface Permission {
  id: string;
  token: string;
  groupId?: string;
  name: string;
  nis: string;
  className: string;
  period: string;
  purpose: string;
  outTime: string;
  deadline: string;
  photo: string;
  photoOut: string | null;
  photoIn: string | null;
  created: string;
  status: PermissionStatus;
  approvedAt: string | null;
  returnedAt: string | null;
  rejectedAt: string | null;
  isLate: boolean;
}

export type UserRole = "guru" | "satpam";

export interface User {
  uid: string;
  username: string;
  role: UserRole;
}

export interface StudentDraft {
  name: string;
  nis: string;
  className: string;
  photo: string;
}
