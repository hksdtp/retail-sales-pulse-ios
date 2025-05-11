
import { UserLocation } from '@/types/user';

export const locationNames: Record<UserLocation | 'all', string> = {
  all: 'Toàn quốc',
  hanoi: 'Hà Nội',
  hcm: 'Hồ Chí Minh'
};

export const positionLabels: Record<string, string> = {
  director: 'Giám đốc Kinh doanh',
  team_leader: 'Trưởng nhóm',
  employee: 'Nhân viên'
};

export const getAvatarText = (name: string) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};
