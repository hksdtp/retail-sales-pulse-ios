
export type UserRole = 'employee' | 'team_leader' | 'director';
export type UserLocation = 'hanoi' | 'hcm';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string;
  location: UserLocation;
  avatar?: string;
  phone?: string;
  position?: string;
  status: 'active' | 'inactive';
}

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  location: UserLocation;
  description?: string;
  created_at: string;
}
