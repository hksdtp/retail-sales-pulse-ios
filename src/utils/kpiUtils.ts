
import { User } from '@/types/user';

export interface KpiItem {
  title: string;
  value: string;
  oldValue: string;
  change: number;
  data: Array<{ value: number }>;
}

export const getKpiDataForUser = (currentUser: User | null): KpiItem[] => {
  // Giả sử là dữ liệu cho Lê Khánh Duy (id: '3')
  if (currentUser?.id === '3') {
    return [
      {
        title: 'Đối tác mới',
        value: '12',
        oldValue: '34',
        change: 8.2,
        data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 15 }))
      },
      {
        title: 'KTS mới',
        value: '8',
        oldValue: '21',
        change: 6.1,
        data: Array(10).fill(0).map((_, i) => ({ value: 7 + Math.random() * 10 }))
      },
      {
        title: 'SBG mới',
        value: '15',
        oldValue: '25',
        change: -3.5,
        data: Array(10).fill(0).map((_, i) => ({ value: 12 + Math.random() * 15 }))
      },
      {
        title: 'Doanh số',
        value: '185tr',
        oldValue: '320tr',
        change: 12.3,
        data: Array(10).fill(0).map((_, i) => ({ value: 150 + Math.random() * 100 }))
      }
    ];
  }
  // Dữ liệu cho Việt Anh (Trưởng nhóm, id: '2')
  else if (currentUser?.id === '2') {
    // Dữ liệu cá nhân của Việt Anh
    const isTeamLeader = currentUser?.role === 'team_leader';
    const isDirector = currentUser?.role === 'retail_director' || currentUser?.role === 'project_director';
    const canViewTeamData = isDirector || isTeamLeader;
    
    if (!canViewTeamData) {
      return [
        {
          title: 'Đối tác mới',
          value: '8',
          oldValue: '25',
          change: 7.5,
          data: Array(10).fill(0).map((_, i) => ({ value: 6 + Math.random() * 10 }))
        },
        {
          title: 'KTS mới',
          value: '5',
          oldValue: '12',
          change: 4.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 3 + Math.random() * 8 }))
        },
        {
          title: 'SBG mới',
          value: '10',
          oldValue: '18',
          change: 3.8,
          data: Array(10).fill(0).map((_, i) => ({ value: 8 + Math.random() * 12 }))
        },
        {
          title: 'Doanh số',
          value: '90tr',
          oldValue: '120tr',
          change: 8.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 80 + Math.random() * 50 }))
        }
      ];
    }
    // Dữ liệu cho trưởng nhóm - bao gồm dữ liệu tổng hợp của cả nhóm
    return [
      {
        title: 'Đối tác mới',
        value: '18',
        oldValue: '42',
        change: 10.5,
        data: Array(10).fill(0).map((_, i) => ({ value: 16 + Math.random() * 18 }))
      },
      {
        title: 'KTS mới',
        value: '12',
        oldValue: '28',
        change: 7.2,
        data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 12 }))
      },
      {
        title: 'SBG mới',
        value: '25',
        oldValue: '38',
        change: 5.8,
        data: Array(10).fill(0).map((_, i) => ({ value: 22 + Math.random() * 20 }))
      },
      {
        title: 'Doanh số',
        value: '275tr',
        oldValue: '380tr',
        change: 14.2,
        data: Array(10).fill(0).map((_, i) => ({ value: 250 + Math.random() * 150 }))
      }
    ];
  }
  // Dữ liệu cho nhân viên khác
  else if (currentUser?.role === 'employee') {
    // Mỗi nhân viên có dữ liệu cá nhân riêng
    return [
      {
        title: 'Đối tác mới',
        value: `${5 + Math.floor(Math.random() * 10)}`,
        oldValue: `${15 + Math.floor(Math.random() * 20)}`,
        change: 5 + Math.random() * 8,
        data: Array(10).fill(0).map((_, i) => ({ value: 4 + Math.random() * 12 }))
      },
      {
        title: 'KTS mới',
        value: `${3 + Math.floor(Math.random() * 7)}`,
        oldValue: `${10 + Math.floor(Math.random() * 15)}`,
        change: 3 + Math.random() * 7,
        data: Array(10).fill(0).map((_, i) => ({ value: 2 + Math.random() * 8 }))
      },
      {
        title: 'SBG mới',
        value: `${8 + Math.floor(Math.random() * 12)}`,
        oldValue: `${20 + Math.floor(Math.random() * 15)}`,
        change: -2 + Math.random() * 6,
        data: Array(10).fill(0).map((_, i) => ({ value: 7 + Math.random() * 14 }))
      },
      {
        title: 'Doanh số',
        value: `${70 + Math.floor(Math.random() * 50)}tr`,
        oldValue: `${120 + Math.floor(Math.random() * 80)}tr`,
        change: 8 + Math.random() * 6,
        data: Array(10).fill(0).map((_, i) => ({ value: 60 + Math.random() * 60 }))
      }
    ];
  }
  // Dữ liệu mặc định (cho Giám đốc và các vai trò khác)
  else {
    return [
      {
        title: 'Đối tác mới',
        value: '28',
        oldValue: '76',
        change: 12.5,
        data: Array(10).fill(0).map((_, i) => ({ value: 15 + Math.random() * 20 }))
      },
      {
        title: 'KTS mới',
        value: '15',
        oldValue: '42',
        change: 8.3,
        data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 15 }))
      },
      {
        title: 'SBG mới',
        value: '42',
        oldValue: '65',
        change: -5.2,
        data: Array(10).fill(0).map((_, i) => ({ value: 30 + Math.random() * 25 }))
      },
      {
        title: 'Doanh số',
        value: '480tr',
        oldValue: '720tr',
        change: 15.8,
        data: Array(10).fill(0).map((_, i) => ({ value: 300 + Math.random() * 200 }))
      }
    ];
  }
};

// Xây dựng tiêu đề phụ (subtitle) dựa trên loại người dùng
export const getDashboardSubtitle = (currentUser: User | null): string => {
  const isDirector = currentUser?.role === 'retail_director' || currentUser?.role === 'project_director';
  const isTeamLeader = currentUser?.role === 'team_leader';
  
  if (isDirector) {
    const departmentType = currentUser?.department_type === 'retail' 
      ? 'Kinh doanh bán lẻ' 
      : 'Kinh doanh dự án';
    return `Tổng quan về hiệu suất kinh doanh phòng ${departmentType}`;
  } else if (isTeamLeader) {
    return "Tổng quan về hiệu suất kinh doanh của nhóm của bạn";
  } else {
    return "Tổng quan về hiệu suất kinh doanh cá nhân của bạn";
  }
};
