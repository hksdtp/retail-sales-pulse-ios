import React, { createContext, useContext, useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import {
  getTeams as getTeamsAPI,
  getUsers as getUsersAPI,
  login as loginAPI,
  updateUser as updateUserAPI,
  changePassword as changePasswordAPI,
} from '@/services/api';
import { isTestEnvironment, setupTestAuth, getTestUser, getTestAuthToken } from '@/utils/testUtils';
import {
  mockLogin,
  mockGetUsers,
  mockGetTeams,
  mockUpdateUser
} from '@/services/mockAuth';
import { Team, User, UserCredentials, UserLocation, UserRole } from '@/types/user';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isFirstLogin: boolean;
  requirePasswordChange: boolean;
  changePassword: (newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  users: User[];
  teams: Team[];
  authToken: string | null;
  loginType: string | null;
  blockAppAccess: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isFirstLogin: false,
  requirePasswordChange: false,
  changePassword: (): any => {},
  updateUser: async () => {},
  users: [],
  teams: [],
  authToken: null,
  loginType: null,
  blockAppAccess: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<string | null>(null);
  const [blockAppAccess, setBlockAppAccess] = useState(false);
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
        console.log('Mock data loaded successfully, skipping API');
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

    } catch (error) {
      console.error('Error loading users and teams:', error);
      // Don't show error toast for network issues, just log
      if (!error.toString().includes('Network') && !error.toString().includes('fetch')) {
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
        // Load users and teams
        await loadUsersAndTeams();

        // DISABLED: Test environment auto-auth to fix session persistence bug
        // Check for test environment and setup test auth if needed
        if (false && isTestEnvironment()) {
          console.log('🧪 Test environment detected, setting up test auth...');
          setupTestAuth();
          const testUser = getTestUser();
          const testToken = getTestAuthToken();
          setCurrentUser(testUser);
          setAuthToken(testToken);
          setIsFirstLogin(false);
          console.log('🧪 Test user authenticated:', testUser.name);
        } else {
          // Check for stored user and token
          const storedUser = localStorage.getItem('currentUser');
          const storedToken = localStorage.getItem('authToken');
          const storedLoginType = localStorage.getItem('loginType');

          console.log('🔍 [AuthContext] Checking localStorage on init:', {
            hasStoredUser: !!storedUser,
            hasStoredToken: !!storedToken,
            storedLoginType,
            userPreview: storedUser ? JSON.parse(storedUser).name : 'none'
          });

          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);

              // IMPORTANT: Ensure user persistence - log detailed info
              console.log('🔄 [AuthContext] Restoring user session:', {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userRole: user.role,
                userTeamId: user.team_id,
                loginType: storedLoginType,
                hasToken: !!storedToken
              });

              setCurrentUser(user);
              setAuthToken(storedToken); // Can be null for bypass login
              setLoginType(storedLoginType);
              setIsFirstLogin(!user.password_changed);

              // Start auto plan sync for restored user
              autoPlanSyncService.startAutoSync(user.id);
              console.log('🔄 Started auto plan sync for restored user:', user.name);

            } catch (error) {
              console.error('❌ [AuthContext] Error parsing stored user data:', error);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('authToken');
              localStorage.removeItem('loginType');
            }
          } else {
            console.log('ℹ️ [AuthContext] No stored user session found');
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

  // Monitor currentUser changes to debug session persistence issues
  useEffect(() => {
    if (currentUser) {
      console.log('👤 [AuthContext] Current user changed:', {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        userTeamId: currentUser.team_id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('👤 [AuthContext] Current user cleared/null');
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    // Reset states
    setRequirePasswordChange(false);
    setBlockAppAccess(false);
    setLoginType(null);

    try {
      console.log('🔐 Attempting login for:', email);

      // Try API authentication first
      const apiResponse = await loginAPI(email, password);
      console.log('📥 API login response:', apiResponse);

      let response;

      // Check if API response is successful
      if (apiResponse.success && apiResponse.data) {
        response = apiResponse;
        
      } else {
        // If API server is running but returns error, don't fallback to mock
        // Only fallback if API server is completely unreachable
        if (apiResponse.error && !apiResponse.error.includes('Network Error') && !apiResponse.error.includes('fetch')) {
          console.log('🚫 API server rejected login, not using mock fallback');
          throw new Error(apiResponse.error || 'Đăng nhập thất bại');
        }

        console.warn('⚠️ API server unreachable, trying mock authentication. API error:', apiResponse.error);
        // Fallback to mock authentication only if API server is unreachable
        response = await mockLogin(email, password);
        console.log('📥 Mock login response:', response);
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Đăng nhập thất bại');
      }

      const { user, token } = response.data;
      const responseLoginType = response.data.loginType || response.loginType;
      const requiresPasswordChange = response.data.requirePasswordChange || false;

      // Set user and token
      setCurrentUser(user);
      setAuthToken(token);
      setLoginType(responseLoginType);

      // Handle first login workflow
      const isFirstLogin = !user.password_changed || requiresPasswordChange;
      setIsFirstLogin(isFirstLogin);
      setRequirePasswordChange(requiresPasswordChange);

      // Block app access if password change is required
      if (requiresPasswordChange && responseLoginType === 'first_login') {
        setBlockAppAccess(true);
        console.log('🚫 Blocking app access - password change required');
      } else {
        setBlockAppAccess(false);
      }

      // Store in localStorage with detailed logging
      console.log('💾 [AuthContext] Storing user session in localStorage:', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        userTeamId: user.team_id,
        loginType: responseLoginType,
        token: token ? 'present' : 'missing'
      });

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      localStorage.setItem('loginType', responseLoginType || '');

      // Verify storage immediately
      const verifyUser = localStorage.getItem('currentUser');
      const verifyToken = localStorage.getItem('authToken');
      const verifyLoginType = localStorage.getItem('loginType');

      console.log('✅ [AuthContext] Verified localStorage storage:', {
        userStored: !!verifyUser,
        tokenStored: !!verifyToken,
        loginTypeStored: !!verifyLoginType,
        storedUserName: verifyUser ? JSON.parse(verifyUser).name : 'none'
      });

      console.log('✅ Login successful for user:', user.name, {
        loginType: responseLoginType,
        requirePasswordChange: requiresPasswordChange,
        blockAppAccess: requiresPasswordChange && responseLoginType === 'first_login'
      });

      // Start auto plan sync service only if not blocked
      if (!requiresPasswordChange) {
        autoPlanSyncService.startAutoSync(user.id);
        console.log('🔄 Started auto plan sync for user:', user.name);
      }

      // Show appropriate toast message
      if (requiresPasswordChange) {
        toast({
          title: 'Đăng nhập lần đầu',
          description: 'Vui lòng đổi mật khẩu để tiếp tục',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Đăng nhập thành công',
          description: `Chào mừng ${user.name}!`,
        });
      }

      return Promise.resolve();
    } catch (error) {
      let errorMessage = 'Đã xảy ra lỗi không xác định';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Clean up error message - remove HTTP status and JSON structure
        if (errorMessage.includes('HTTP 401:') || errorMessage.includes('HTTP 400:')) {
          // Extract just the error message from JSON if present
          const jsonMatch = errorMessage.match(/\{"success":false,"error":"([^"]+)"\}/);
          if (jsonMatch && jsonMatch[1]) {
            errorMessage = jsonMatch[1];
          } else {
            // Fallback: remove HTTP status prefix
            errorMessage = errorMessage.replace(/^HTTP \d+: [^-]+ - /, '');
          }
        }
      }

      console.error('❌ Login error:', error);

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
    console.log('🚪 Logging out user');

    // Stop auto plan sync service
    autoPlanSyncService.stopAutoSync();
    console.log('⏹️ Stopped auto plan sync');

    // Reset all auth states
    setCurrentUser(null);
    setAuthToken(null);
    setIsFirstLogin(false);
    setRequirePasswordChange(false);
    setBlockAppAccess(false);
    setLoginType(null);

    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginType');

    toast({
      title: 'Đăng xuất thành công',
      description: 'Bạn đã đăng xuất khỏi hệ thống',
    });
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) {
      throw new Error('Không có người dùng hiện tại');
    }

    try {
      console.log('🔄 Changing password for user:', currentUser.id);

      // Try API change password first
      const apiResponse = await changePasswordAPI(currentUser.id, newPassword);
      console.log('📥 API change password response:', apiResponse);

      if (apiResponse.success) {
        // Update current user state
        const updatedUser = { ...currentUser, password_changed: true };
        setCurrentUser(updatedUser);

        // Reset first login states
        setIsFirstLogin(false);
        setRequirePasswordChange(false);
        setBlockAppAccess(false);

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Start auto plan sync service now that password is changed
        autoPlanSyncService.startAutoSync(currentUser.id);
        console.log('🔄 Started auto plan sync after password change');

        toast({
          title: 'Đổi mật khẩu thành công',
          description: 'Mật khẩu của bạn đã được cập nhật. Bạn có thể sử dụng ứng dụng ngay bây giờ.',
        });
      } else {
        throw new Error(apiResponse.error || 'API change password failed');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);

      // Fallback to local update if API fails
      try {
        const updatedUserData = {
          password: newPassword,
          password_changed: true,
        };

        await updateUser(updatedUserData);

        // Reset first login states
        setIsFirstLogin(false);
        setRequirePasswordChange(false);
        setBlockAppAccess(false);

        toast({
          title: 'Đổi mật khẩu thành công',
          description: 'Mật khẩu của bạn đã được cập nhật (fallback)',
        });
      } catch (fallbackError) {
        console.error('❌ Fallback password change also failed:', fallbackError);
        toast({
          title: 'Đổi mật khẩu thất bại',
          description: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.',
          variant: 'destructive',
        });
        throw fallbackError;
      }
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!currentUser) {
      throw new Error('Không có người dùng hiện tại');
    }

    try {
      console.log('Updating user:', currentUser.id, userData);

      // Try to update via API
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
        isAuthenticated: !!currentUser && !blockAppAccess,
        login,
        logout,
        isLoading,
        isFirstLogin,
        requirePasswordChange,
        changePassword,
        updateUser,
        users,
        teams,
        authToken,
        loginType,
        blockAppAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
