export type DepartmentType = string | 'project' | 'retail';
export type UserRole =
  | string
  | 'employee'
  | 'team_leader'
  | 'retail_director'
  | 'project_director'
  | 'project_supervisor'
  | 'project_admin'
  | 'project_staff';
export type UserLocation = string | 'hanoi' | 'hcm';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  location: UserLocation;
  team_id?: string;
  department?: DepartmentType;
  department_type?: DepartmentType;
  avatar?: string;
  phone?: string;
  position?: string;
  status: string | 'active' | 'inactive';
  password_changed: boolean; // Đánh dấu người dùng đã đổi mật khẩu chưa
}

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  location: UserLocation;
  description?: string;
  created_at: string;
  department?: DepartmentType;
  department_type?: DepartmentType;
}

export interface UserCredentials {
  email: string;
  password: string;
}
