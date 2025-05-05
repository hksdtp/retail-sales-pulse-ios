
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserLocation } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false
});

export const useAuth = () => useContext(AuthContext);

// Mock data - sẽ được thay thế bằng API thực tế sau này
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'director@example.com',
    role: 'director',
    team_id: '0',
    location: 'hanoi',
    position: 'Giám đốc Kinh doanh',
    status: 'active'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'leader_hn1@example.com',
    role: 'team_leader',
    team_id: '1',
    location: 'hanoi',
    position: 'Trưởng nhóm 1 - Hà Nội',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'leader_hn2@example.com',
    role: 'team_leader',
    team_id: '2',
    location: 'hanoi',
    position: 'Trưởng nhóm 2 - Hà Nội',
    status: 'active'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'leader_hcm1@example.com',
    role: 'team_leader',
    team_id: '3',
    location: 'hcm',
    position: 'Trưởng nhóm 1 - HCM',
    status: 'active'
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'employee_hn1@example.com',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    position: 'Nhân viên kinh doanh',
    status: 'active'
  },
  {
    id: '6',
    name: 'Đỗ Thị F',
    email: 'employee_hcm1@example.com',
    role: 'employee',
    team_id: '3',
    location: 'hcm',
    position: 'Nhân viên kinh doanh',
    status: 'active'
  }
];

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Giả lập API call - sau này sẽ thay bằng gọi API thực
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }
      
      // Lưu thông tin người dùng vào state và localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
