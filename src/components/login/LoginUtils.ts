
import { User, Team, UserLocation } from '@/types/user';

export const getAvatarText = (name: string): string => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

export const positionLabels: Record<string, string> = {
  director: 'Giám đốc Kinh doanh',
  team_leader: 'Trưởng nhóm',
  employee: 'Nhân viên'
};

export const locationNames: Record<string, string> = {
  all: 'Toàn quốc',
  hanoi: 'Hà Nội',
  hcm: 'Hồ Chí Minh'
};

export const getFilteredTeams = (teams: Team[], selectedLocation: UserLocation | 'all'): Team[] => {
  if (selectedLocation === 'all') {
    return []; // Không hiển thị teams khi chọn "Toàn Quốc"
  }
  return teams.filter(team => team.location === selectedLocation);
};

export const getFilteredUsers = (
  users: User[], 
  selectedTeam: Team | null, 
  selectedLocation: UserLocation | 'all'
): User[] => {
  // Nếu chọn "Toàn Quốc", chỉ hiển thị người dùng có vai trò "director"
  if (selectedLocation === 'all') {
    return users.filter(user => user.role === 'director');
  }
  
  // Nếu đã chọn team, lọc người dùng theo team
  if (selectedTeam) {
    return users.filter(user => user.team_id === selectedTeam.id);
  }
  
  // Nếu chỉ chọn location mà không chọn team, hiển thị tất cả người dùng thuộc location đó
  return users.filter(user => user.location === selectedLocation);
};

export const getTeamMembers = (users: User[], teamId: string): User[] => {
  return users.filter(user => user.team_id === teamId);
};
