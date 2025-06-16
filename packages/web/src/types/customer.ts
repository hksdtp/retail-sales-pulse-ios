export type CustomerType = 'customer' | 'architect' | 'partner';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  assignedTo: string; // User ID của người phụ trách
  assignedToName?: string; // Tên người phụ trách (for display)
  createdBy: string; // User ID của người tạo
  createdByName?: string; // Tên người tạo (for display)
  createdAt: string;
  updatedAt?: string;
  teamId?: string; // Team ID (for team-level access)
  location?: string; // Location (hanoi/hcm)
  status?: 'active' | 'inactive';
}

export interface CustomerFormData {
  name: string;
  type: CustomerType;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  assignedTo?: string;
}

export interface CustomerPermissions {
  canViewAll: boolean; // Admin/Manager cấp cao
  canViewTeam: boolean; // Trưởng nhóm
  canViewPersonal: boolean; // Nhân viên
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean; // Có thể gán khách hàng cho người khác
}

export interface CustomerFilters {
  type?: CustomerType;
  assignedTo?: string;
  teamId?: string;
  location?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'architect', label: 'Kiến trúc sư' },
  { value: 'partner', label: 'Đối tác' },
];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  customer: 'Khách hàng',
  architect: 'Kiến trúc sư',
  partner: 'Đối tác',
};
