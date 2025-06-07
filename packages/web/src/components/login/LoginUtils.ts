import { UserLocation } from '@/types/user';

export const locationNames: Record<UserLocation | 'all', string> = {
  all: 'Toàn quốc',
  hanoi: 'Hà Nội',
  hcm: 'Hồ Chí Minh',
};

export const positionLabels: Record<string, string> = {
  // Vai trò phòng Bán lẻ
  retail_director: 'Trưởng phòng Kinh doanh bán lẻ',
  team_leader: 'Trưởng nhóm',
  employee: 'Nhân viên',

  // Vai trò phòng Dự án
  project_director: 'Trưởng phòng Kinh doanh Dự án',
  project_supervisor: 'Giám sát Dự án',
  project_admin: 'Sales Admin Dự án',
  project_staff: 'Nhân viên Kinh doanh Dự án',
};

export const getAvatarText = (name: string) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};
