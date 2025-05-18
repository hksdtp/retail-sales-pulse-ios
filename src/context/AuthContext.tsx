
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
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    created_at: '2023-01-01'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '4',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    created_at: '2023-01-01'
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: '6',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 3 Hà Nội',
    created_at: '2023-01-15'
  },
  {
    id: '4',
    name: 'NHÓM 4',
    leader_id: '7',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 4 Hà Nội',
    created_at: '2023-02-01'
  },
  {
    id: '5',
    name: 'NHÓM 1',
    leader_id: '8',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    created_at: '2023-01-01'
  },
  {
    id: '6',
    name: 'NHÓM 2',
    leader_id: '10',
    location: 'hcm',
    description: 'Nhóm kinh doanh 2 Hồ Chí Minh',
    created_at: '2023-01-15'
  }
];

// Dữ liệu mẫu chi tiết người dùng
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'director@example.com',
    role: 'director',
    team_id: '0',
    location: 'hanoi',
    department: 'retail',
    position: 'Giám đốc Kinh doanh',
    status: 'active',
    password_changed: true
  },
  {
    id: '12',
    name: 'Hà Xuân Trường',
    email: 'truong@example.com',
    role: 'director',
    team_id: '0',
    location: 'hanoi',
    department: 'project',
    position: 'Trưởng Phòng Kinh Doanh Dự Án',
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
    position: 'Trưởng nhóm 1 - Hà Nội',
    status: 'active',
    password_changed: false
  },
  {
    id: '3',
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    position: 'Nhân viên Sale',
    status: 'active',
    password_changed: false
  },
  {
    id: '4',
    name: 'Nguyễn Thị Thảo',
    email: 'thao@example.com',
    role: 'team_leader',
    team_id: '2',
    location: 'hanoi',
    position: 'Trưởng nhóm 2 - Hà Nội',
    status: 'active',
    password_changed: false
  },
  {
    id: '5',
    name: 'Nguyễn Mạnh Linh',
    email: 'manhlinh@example.com',
    role: 'employee',
    team_id: '2',
    location: 'hanoi',
    position: 'Nhân viên Sale',
    status: 'active',
    password_changed: false
  },
  {
    id: '6',
    name: 'Trịnh Thị Bốn',
    email: 'bon@example.com',
    role: 'team_leader',
    team_id: '3',
    location: 'hanoi',
    position: 'Trưởng nhóm 3 - Hà Nội',
    status: 'active',
    password_changed: false
  },
  {
    id: '7',
    name: 'Phạm Thị Hương',
    email: 'huong@example.com',
    role: 'team_leader',
    team_id: '4',
    location: 'hanoi',
    position: 'Trưởng nhóm 4 - Hà Nội',
    status: 'active',
    password_changed: false
  },
  {
    id: '8',
    name: 'Nguyễn Thị Nga',
    email: 'nga@example.com',
    role: 'team_leader',
    team_id: '5',
    location: 'hcm',
    position: 'Trưởng nhóm 1 - HCM',
    status: 'active',
    password_changed: false
  },
  {
    id: '9',
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen@example.com',
    role: 'employee',
    team_id: '5',
    location: 'hcm',
    position: 'Nhân viên Sale',
    status: 'active',
    password_changed: false
  },
  {
    id: '10',
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'khanh@example.com',
    role: 'team_leader',
    team_id: '6',
    location: 'hcm',
    position: 'Trưởng nhóm 2 - HCM',
    status: 'active',
    password_changed: false
  },
  {
    id: '11',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    role: 'employee',
    team_id: '6',
    location: 'hcm',
    position: 'Nhân viên Sale',
    status: 'active',
    password_changed: false
  }
];

// Lưu trữ mật khẩu (trong thực tế sẽ được hash và lưu trong database)
const DEFAULT_PASSWORD = '123';
const MOCK_CREDENTIALS: Record<string, string> = {};

// Tạo mật khẩu mặc định cho tất cả người dùng
MOCK_USERS.forEach(user => {
  MOCK_CREDENTIALS[user.email] = DEFAULT_PASSWORD;
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
    } catch (error: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive"
      });
      return Promise.reject(error);
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
