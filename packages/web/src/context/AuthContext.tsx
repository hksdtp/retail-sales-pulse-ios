import React, { createContext, useContext, useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { FirebaseService } from '@/services/FirebaseService';
import {
  getTeams as getTeamsAPI,
  getUsers as getUsersAPI,
  login as loginAPI,
  updateUser as updateUserAPI,
} from '@/services/api';
import {
  mockLogin,
  mockGetUsers,
  mockGetTeams,
  mockUpdateUser
} from '@/services/mockAuth';
import { Team, User, UserCredentials, UserLocation, UserRole } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isFirstLogin: boolean;
  changePassword: (newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  users: User[];
  teams: Team[];
  authToken: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isFirstLogin: false,
  changePassword: (): any => {},
  updateUser: async () => {},
  users: [],
  teams: [],
  authToken: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Load users và teams từ Mock/API (tránh Firebase CORS)
  const loadUsersAndTeams = async () => {
    try {
      console.log('Loading users and teams from Mock/API...');

      // Prioritize Mock data first (has real data)
      console.log('Loading from Mock data (prioritized)...');
      const [mockUsersResponse, mockTeamsResponse] = await Promise.all([
        mockGetUsers(),
        mockGetTeams(),
      ]);

      if (mockUsersResponse.success && mockUsersResponse.data) {
        setUsers(mockUsersResponse.data as any);
        console.log(`Loaded ${mockUsersResponse.data.length} users from Mock`);
      }

      if (mockTeamsResponse.success && mockTeamsResponse.data) {
        setTeams(mockTeamsResponse.data as any);
        console.log(`Loaded ${mockTeamsResponse.data.length} teams from Mock`);
      }

      // If mock data loaded successfully, return early
      if (mockUsersResponse.success && mockTeamsResponse.success) {
        console.log('Mock data loaded successfully, skipping Firebase/API');
        return;
      }

      // Try API as fallback
      console.log('Mock data failed, trying API...');
      const [usersResponse, teamsResponse] = await Promise.all([getUsersAPI(), getTeamsAPI()]);

      if (usersResponse.success && usersResponse.data && teamsResponse.success && teamsResponse.data) {
        setUsers(usersResponse.data);
        setTeams(teamsResponse.data as any);
        console.log(`Loaded ${usersResponse.data.length} users and ${teamsResponse.data.length} teams from API`);
        return;
      } else {
        console.warn('API also failed. Users error:', usersResponse.error, 'Teams error:', teamsResponse.error);
      }

      // Try Firebase last (may have CORS issues)
      try {
        const firebaseService = FirebaseService.getInstance();
        if (firebaseService.getFirestore()) {
          console.log('Trying Firebase as last resort...');
          const [usersData, teamsData] = await Promise.all([
            firebaseService.getDocuments('users'),
            firebaseService.getDocuments('teams'),
          ]);

          if (usersData.length > 0 || teamsData.length > 0) {
            setUsers(usersData as User[]);
            setTeams(teamsData as Team[]);
            console.log(
              `Loaded ${usersData.length} users and ${teamsData.length} teams from Firebase`,
            );
            return;
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase failed (CORS or network issue):', firebaseError);
      }

    } catch (error) {
      console.error('Error loading users and teams:', error);
      // Don't show error toast for CORS issues, just log
      if (!error.toString().includes('CORS') && !error.toString().includes('access control')) {
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải danh sách người dùng và nhóm',
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Firebase if configured
        const firebaseService = FirebaseService.initializeFromLocalStorage();
        if (firebaseService) {
          console.log('Firebase initialized from localStorage');
        }

        // Load users and teams
        await loadUsersAndTeams();

        // Check for stored user and token
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setAuthToken(storedToken);
            setIsFirstLogin(!user.password_changed);
            console.log('Restored user session from localStorage');
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);

      // Try API authentication first
      const apiResponse = await loginAPI(email, password);
      console.log('API login response:', apiResponse);

      let response;

      // Check if API response is successful
      if (apiResponse.success && apiResponse.data) {
        response = apiResponse;
        console.log('Using API authentication');
      } else {
        console.warn('API login failed, trying mock authentication. API error:', apiResponse.error);
        // Fallback to mock authentication
        response = await mockLogin(email, password);
        console.log('Mock login response:', response);
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Đăng nhập thất bại');
      }

      const { user, token } = response.data;

      // Set user and token
      setCurrentUser(user);
      setAuthToken(token);
      setIsFirstLogin(!user.password_changed);

      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      console.log('Login successful for user:', user.name);

      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng ${user.name}!`,
      });

      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      console.error('Login error:', error);

      toast({
        title: 'Đăng nhập thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
      return Promise.reject(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setCurrentUser(null);
    setAuthToken(null);
    setIsFirstLogin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');

    toast({
      title: 'Đăng xuất thành công',
      description: 'Bạn đã đăng xuất khỏi hệ thống',
    });
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) return;

    try {
      console.log('Changing password for user:', currentUser.id);

      // Update password via Firebase/API
      const updatedUserData = {
        password: newPassword,
        password_changed: true,
      };

      await updateUser(updatedUserData);
      setIsFirstLogin(false);

      toast({
        title: 'Đổi mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Đổi mật khẩu thất bại',
        description: 'Có lỗi xảy ra khi đổi mật khẩu',
        variant: 'destructive',
      });
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!currentUser) {
      throw new Error('Không có người dùng hiện tại');
    }

    try {
      console.log('Updating user:', currentUser.id, userData);

      // Try to update via Firebase first if configured
      const firebaseService = FirebaseService.getInstance();
      if (firebaseService.getFirestore()) {
        const success = await firebaseService.updateDocument('users', currentUser.id, userData);
        if (success) {
          // Update local state
          const updatedUser = { ...currentUser, ...userData };
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          // Update users state to reflect changes
          setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === currentUser.id ? { ...user, ...userData } : user)),
          );

          toast({
            title: 'Cập nhật thành công',
            description: 'Thông tin cá nhân đã được cập nhật',
          });
          return;
        }
      }

      // Fallback to API if Firebase is not configured or fails
      const response = await updateUserAPI(currentUser.id, userData);

      if (response.success && response.data) {
        // Update local state with response data
        const updatedUser = { ...currentUser, ...response.data };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update users state to reflect changes
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === currentUser.id ? { ...user, ...response.data } : user,
          ),
        );

        toast({
          title: 'Cập nhật thành công',
          description: 'Thông tin cá nhân đã được cập nhật',
        });
      } else {
        throw new Error(response.error || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      console.error('Error updating user:', error);
      toast({
        title: 'Cập nhật thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        isLoading,
        isFirstLogin,
        changePassword,
        updateUser,
        users,
        teams,
        authToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
