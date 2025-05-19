
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserLocation, Team, UserCredentials } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isFirstLogin: boolean;
  changePassword: (newPassword: string) => void;
  users: User[];
  teams: Team[];
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isFirstLogin: false,
  changePassword: () => {},
  users: [],
  teams: []
});

export const useAuth = () => useContext(AuthContext);

// Dữ liệu mẫu các nhóm
const MOCK_TEAMS: Team[] = [
  // Nhóm phòng Bán lẻ
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '4',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: '6',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 3 Hà Nội',
    created_at: '2023-01-15',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '4',
    name: 'NHÓM 4',
    leader_id: '7',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 4 Hà Nội',
    created_at: '2023-02-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '5',
    name: 'NHÓM 1',
    leader_id: '8',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '6',
    name: 'NHÓM 2',
    leader_id: '10',
    location: 'hcm',
    description: 'Nhóm kinh doanh 2 Hồ Chí Minh',
    created_at: '2023-01-15',
    department: 'retail',
    department_type: 'retail'
  },
  
  // Nhóm phòng Dự án
  {
    id: '7',
    name: 'NHÓM KỸ THUẬT DỰ ÁN',
    leader_id: '13',
    location: 'hanoi',
    description: 'Nhóm kỹ thuật dự án Hà Nội',
    created_at: '2023-01-01',
    department: 'project',
    department_type: 'project'
  },
  {
    id: '8',
    name: 'NHÓM SALES ADMIN',
    leader_id: '14',
    location: 'hanoi',
    description: 'Nhóm sales admin dự án Hà Nội',
    created_at: '2023-01-01',
    department: 'project',
    department_type: 'project'
  },
  {
    id: '9',
    name: 'NHÓM KINH DOANH DỰ ÁN',
    leader_id: '16',
    location: 'hanoi',
    description: 'Nhóm kinh doanh dự án Hà Nội',
    created_at: '2023-01-15',
    department: 'project',
    department_type: 'project'
  },
  {
    id: '10',
    name: 'NHÓM GIÁM SÁT',
    leader_id: '18',
    location: 'hcm',
    description: 'Nhóm giám sát dự án HCM',
    created_at: '2023-02-01',
    department: 'project',
    department_type: 'project'
  },
  {
    id: '11',
    name: 'NHÓM KINH DOANH',
    leader_id: '17',
    location: 'hcm',
    description: 'Nhóm kinh doanh dự án HCM',
    created_at: '2023-01-01',
    department: 'project',
    department_type: 'project'
  },
  {
    id: '12',
    name: 'NHÓM SALES ADMIN',
    leader_id: '20',
    location: 'hcm',
    description: 'Nhóm sales admin dự án HCM',
    created_at: '2023-01-15',
    department: 'project',
    department_type: 'project'
  }
];

// Dữ liệu mẫu chi tiết người dùng
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    role: 'retail_director',
    team_id: '0',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng phòng kinh doanh bán lẻ',
    status: 'active',
    password_changed: true
  },
  {
    id: '2',
    name: 'Lương Việt Anh',
    email: 'vietanh@example.com',
    role: 'team_leader',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '3',
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '4',
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@example.com',
    role: 'team_leader',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '5',
    name: 'Nguyễn Mạnh Linh',
    email: 'manhlinh@example.com',
    role: 'employee',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '6',
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@example.com',
    role: 'team_leader',
    team_id: '3',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '7',
    name: 'Phạm Thị Hương',
    email: 'huong.pham@example.com',
    role: 'team_leader',
    team_id: '4',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '8',
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    role: 'team_leader',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '9',
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@example.com',
    role: 'employee',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '10',
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'vietkhanh@example.com',
    role: 'team_leader',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '11',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    role: 'employee',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  // Phòng Kinh doanh Dự án - Hà Nội
  {
    id: '12',
    name: 'Hà Xuân Trường',
    email: 'truong.ha@example.com',
    role: 'project_director',
    team_id: '0',
    location: 'hanoi',
    department: 'project',
    department_type: 'project',
    position: 'Trưởng phòng Kinh doanh Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '13',
    name: 'Trần Hồng Công',
    email: 'cong.tran@example.com',
    role: 'project_supervisor',
    team_id: '7',
    location: 'hanoi',
    department: 'project',
    department_type: 'project',
    position: 'Giám sát kỹ thuật Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '14',
    name: 'Trần Thị Hải Anh',
    email: 'haianh.tran@example.com',
    role: 'project_admin',
    team_id: '8',
    location: 'hanoi',
    department: 'project',
    department_type: 'project',
    position: 'Sales Admin Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '15',
    name: 'Ngô Thị Trang',
    email: 'trang.ngo@example.com',
    role: 'project_admin',
    team_id: '8',
    location: 'hanoi',
    department: 'project',
    department_type: 'project',
    position: 'Sales Admin Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '16',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    role: 'project_staff',
    team_id: '9',
    location: 'hanoi',
    department: 'project',
    department_type: 'project',
    position: 'Nhân viên Kinh doanh Dự án',
    status: 'active',
    password_changed: true
  },
  // Phòng Kinh doanh Dự án - Hồ Chí Minh
  {
    id: '17',
    name: 'Nguyễn Thị Diễm Hương',
    email: 'diemhuong.nguyen@example.com',
    role: 'project_staff',
    team_id: '11',
    location: 'hcm',
    department: 'project',
    department_type: 'project',
    position: 'Nhân viên Kinh doanh Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '18',
    name: 'Huỳnh Bá Hiếu',
    email: 'hieu.huynh@example.com',
    role: 'project_supervisor',
    team_id: '10',
    location: 'hcm',
    department: 'project',
    department_type: 'project',
    position: 'Giám sát Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '19',
    name: 'Hoàng Dương Hà Nhi',
    email: 'hahanh.hoang@example.com',
    role: 'project_staff',
    team_id: '11',
    location: 'hcm',
    department: 'project',
    department_type: 'project',
    position: 'Nhân viên Kinh doanh Dự án',
    status: 'active',
    password_changed: true
  },
  {
    id: '20',
    name: 'Lâm Mỹ Phụng',
    email: 'myphung.lam@example.com',
    role: 'project_admin',
    team_id: '12',
    location: 'hcm',
    department: 'project',
    department_type: 'project',
    position: 'Sales Admin Dự án',
    status: 'active',
    password_changed: true
  }
];

// Lưu trữ mật khẩu (trong thực tế sẽ được hash và lưu trong database)
const DEFAULT_PASSWORD = '123';
const MOCK_CREDENTIALS: Record<string, string> = {};

// Tạo mật khẩu mặc định cho tất cả người dùng
MOCK_USERS.forEach(user => {
  if (user.email) {
    MOCK_CREDENTIALS[user.email] = DEFAULT_PASSWORD;
  }
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsFirstLogin(!user.password_changed);
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu người dùng:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Kiểm tra thông tin đăng nhập
      const storedPassword = MOCK_CREDENTIALS[email];
      
      if (!storedPassword) {
        throw new Error('Tài khoản không tồn tại');
      }
      
      if (storedPassword !== password) {
        throw new Error('Mật khẩu không chính xác');
      }
      
      // Tìm thông tin người dùng
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Lưu thông tin người dùng vào state và localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Kiểm tra xem đây có phải là lần đăng nhập đầu tiên
      setIsFirstLogin(!user.password_changed);
      
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive"
      });
      return Promise.reject(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsFirstLogin(false);
    localStorage.removeItem('currentUser');
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return;
    
    // Trong môi trường thực tế, cần gọi API để cập nhật mật khẩu
    // Ở đây chúng ta chỉ cập nhật trong dữ liệu mẫu
    MOCK_CREDENTIALS[currentUser.email] = newPassword;
    
    // Cập nhật trạng thái đã đổi mật khẩu
    const updatedUser = {
      ...currentUser,
      password_changed: true
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsFirstLogin(false);
    
    toast({
      title: "Đổi mật khẩu thành công",
      description: "Mật khẩu của bạn đã được cập nhật"
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      isLoading,
      isFirstLogin,
      changePassword,
      users: MOCK_USERS,
      teams: MOCK_TEAMS
    }}>
      {children}
    </AuthContext.Provider>
  );
};
