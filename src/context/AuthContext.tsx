
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserLocation, Team, UserCredentials } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { mockTeams, mockUsers, mockCredentials, DEFAULT_PASSWORD } from '@/utils/mockData';

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
      const storedPassword = mockCredentials[email];
      
      if (!storedPassword) {
        throw new Error('Tài khoản không tồn tại');
      }
      
      if (storedPassword !== password) {
        throw new Error('Mật khẩu không chính xác');
      }
      
      // Tìm thông tin người dùng
      const user = mockUsers.find(u => u.email === email);
      
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
    mockCredentials[currentUser.email] = newPassword;
    
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
      users: mockUsers,
      teams: mockTeams
    }}>
      {children}
    </AuthContext.Provider>
  );
};
