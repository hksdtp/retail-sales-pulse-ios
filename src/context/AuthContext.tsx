
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserLocation, Team, UserCredentials } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import passwordService from '@/services/passwordService';

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
    leader_id: '12',
    location: 'hanoi',
    description: 'Nhóm 4 - Hà Nội',
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
    name: 'Quản Thu Hà',
    email: 'ha.quan@example.com',
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
    id: '12',
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

];

// Lưu trữ mật khẩu (trong thực tế sẽ được hash và lưu trong database)
const DEFAULT_PASSWORD = '123456';
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
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { toast } = useToast();

  // Load users và teams từ API
  const loadUsersAndTeams = async () => {
    try {
      // Force sử dụng MOCK_DATA để đảm bảo dữ liệu nhất quán
      console.log('Using mock users and teams data');
      setUsers(MOCK_USERS);
      setTeams(MOCK_TEAMS);
    } catch (error) {
      console.error('Lỗi khi tải users và teams:', error);
      // Fallback to mock data nếu có lỗi
      setUsers(MOCK_USERS);
      setTeams(MOCK_TEAMS);
    }
  };

  useEffect(() => {
    // Load users và teams
    loadUsersAndTeams();

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
      // Tìm thông tin người dùng
      let user = users.find(u => u.email === email);
      if (!user) {
        user = MOCK_USERS.find(u => u.email === email);
      }

      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }

      // Sử dụng passwordService để xác thực
      const isValidPassword = passwordService.verifyPassword(user.id, password);
      if (!isValidPassword) {
        throw new Error('Mật khẩu không chính xác');
      }

      // Kiểm tra xem có phải lần đăng nhập đầu tiên không
      const isFirstLoginCheck = passwordService.isFirstLogin(user.id);

      // Lưu thông tin người dùng vào state và localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsFirstLogin(isFirstLoginCheck);

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

    // Sử dụng passwordService để đổi mật khẩu
    const success = passwordService.changePassword(currentUser.id, newPassword);

    if (success) {
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
    } else {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: "Có lỗi xảy ra khi đổi mật khẩu",
        variant: "destructive"
      });
    }
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
      users: users,
      teams: teams
    }}>
      {children}
    </AuthContext.Provider>
  );
};
