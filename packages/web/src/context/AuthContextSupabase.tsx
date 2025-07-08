import React, { createContext, useContext, useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';
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
  mockUpdateUser,
  mockChangePassword,
  debugUserPasswordStatus,
  debugListAllUsers,
  debugAllStoredPasswords,
  debugLocalStorageAccess,
  getStoredPassword,
  restoreStoredPassword,
  autoRestoreKnownPasswords,
  resetAllPasswordsToDefault,
  disablePasswordResetMode,
  ultimatePasswordReset,
  syncPasswordResetToSupabase,
  syncPasswordChangeToSupabase,
  updateAllUsersPasswordChangedToFalse,
  ensurePasswordColumnInSupabase,
  addPasswordColumnToSupabaseSQL,
  testCompletePasswordSyncFlow,
  fixPasswordChangeRequirement,
  forceResetManhPasswordChanged,
  fixUserDataConsistency
} from '@/services/mockAuth';
import { Team, User, UserCredentials, UserLocation, UserRole } from '@/types/user';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';
import { LocalToSupabaseAutoSync } from '@/services/LocalToSupabaseAutoSync';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  // Load users và teams từ Supabase/Mock/API
  const loadUsersAndTeams = async () => {
    try {
      console.log('Loading users and teams from Supabase/Mock/API...');

      // TEMPORARILY SKIP SUPABASE - Use mock data with updated structure
      console.log('🔧 TEMPORARILY SKIPPING SUPABASE - Using mock data for updated structure');

      // Try Supabase first if configured (DISABLED FOR NOW)
      if (false) {
        try {
          const supabaseService = SupabaseService.getInstance();
          if (supabaseService.isInitialized()) {
            console.log('Loading from Supabase...');
            const [usersData, teamsData] = await Promise.all([
              supabaseService.getUsers(),
              supabaseService.getTeams(),
            ]);

            if (usersData.length > 0 || teamsData.length > 0) {
              setUsers(usersData);
              setTeams(teamsData);
              console.log(
                `Loaded ${usersData.length} users and ${teamsData.length} teams from Supabase`,
              );
              return;
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase failed, trying fallback:', supabaseError);
        }
      }

      // Fallback to Mock data (has real data)
      console.log('Loading from Mock data (fallback)...');
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

      // Try API as last fallback
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
        // Auto-restore known stored passwords for testing
        autoRestoreKnownPasswords();

        // Initialize Supabase if configured
        const supabaseService = SupabaseService.initializeFromLocalStorage();
        if (supabaseService) {
          console.log('Supabase initialized from localStorage');
        }

        // Load users and teams
        await loadUsersAndTeams();

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
            userPreview: storedUser ? JSON.parse(storedUser).name : 'none',
            rawStoredUser: storedUser,
            rawStoredToken: storedToken
          });

          // Check if user just logged out
          const justLoggedOut = sessionStorage.getItem('justLoggedOut');
          if (justLoggedOut) {
            console.log('🚫 [AuthContext] User just logged out, skipping session restore');
            sessionStorage.removeItem('justLoggedOut');
            return;
          }

          // Only restore session if not on login page (to force proper login flow)
          const isOnLoginPage = window.location.pathname === '/login';
          const shouldRestoreSession = storedUser && !isLoggingOut && !isOnLoginPage;

          console.log('🔍 [AuthContext] Session restore decision:', {
            hasStoredUser: !!storedUser,
            isLoggingOut,
            isOnLoginPage,
            shouldRestoreSession,
            currentPath: window.location.pathname
          });

          if (shouldRestoreSession) {
            try {
              const user = JSON.parse(storedUser);

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
              setAuthToken(storedToken);
              setLoginType(storedLoginType);

              // Fix: Properly set password change requirements after refresh - NO ADMIN EXCEPTION
              // REMOVED: Admin bypass logic for Khổng Đức Mạnh
              // ALWAYS check password_changed status for ALL users including directors
              const needsPasswordChange = !user.password_changed;

              console.log('🔍 [AuthContext] Session restore - password change check:', {
                userId: user.id,
                userName: user.name,
                passwordChanged: user.password_changed,
                needsPasswordChange
              });

              setIsFirstLogin(needsPasswordChange);
              setRequirePasswordChange(needsPasswordChange);

              // CRITICAL: Set blockAppAccess if password change is required for ALL users
              if (needsPasswordChange) {
                setBlockAppAccess(true);
                console.log('🚫 [AuthContext] Blocking app access - password change required for user:', user.name);
              } else {
                setBlockAppAccess(false);
                console.log('✅ [AuthContext] App access allowed for user:', user.name, '(password already changed)');
              }

              console.log('🔄 [AuthContext] Restored session with password change status:', {
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                passwordChanged: user.password_changed,
                needsPasswordChange,
                isFirstLogin: needsPasswordChange,
                requirePasswordChange: needsPasswordChange,
                blockAppAccess: needsPasswordChange,
                currentUrl: window.location.href
              });

              // Start auto plan sync for restored user
              autoPlanSyncService.startAutoSync(user.id);
              console.log('🔄 Started auto plan sync for restored user:', user.name);

              console.log('✅ [AuthContext] Successfully restored user session from localStorage');
            } catch (error) {
              console.error('❌ [AuthContext] Error parsing stored user data:', error);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('authToken');
              localStorage.removeItem('loginType');
            }
          } else {
            console.log('ℹ️ [AuthContext] No stored user session found');

            // Clear any stale auth states
            setCurrentUser(null);
            setIsFirstLogin(false);
            setRequirePasswordChange(false);
            setBlockAppAccess(false);

            // If not on login page and no valid session, redirect to login
            if (!isOnLoginPage && !isLoggingOut) {
              console.log('🔄 [AuthContext] No valid session and not on login page, redirecting...');
              window.location.replace('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Remove isLoggingOut dependency to prevent re-initialization

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

    // Debug: Also log to window for easy access
    (window as any).currentUser = currentUser;
    (window as any).authState = {
      currentUser,
      isFirstLogin,
      requirePasswordChange,
      blockAppAccess,
      authToken,
      loginType
    };
    console.log('🔧 Auth state exposed to window.authState and window.currentUser');
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    // Reset states
    setRequirePasswordChange(false);
    setBlockAppAccess(false);
    setLoginType(null);
    setIsLoggingOut(false); // Reset logout flag

    try {
      console.log('🔐 Attempting login for:', email);

      // Try Supabase authentication first if configured (DISABLED FOR NOW)
      const supabaseService = SupabaseService.getInstance();
      let response;

      if (false && supabaseService.isInitialized()) {
        try {
          console.log('🚀 Trying Supabase authentication...');

          // For development: Use mock authentication with Supabase users
          // Since sample users don't have real Supabase Auth accounts
          const userData = await supabaseService.getUserByEmail(email);

          if (userData) {
            // Check if user has changed password
            const userStoredPassword = localStorage.getItem(`user_password_${userData.id}`);
            const correctPassword = userStoredPassword || '123456'; // Default to 123456 if no stored password

            console.log('🔍 Password check:', {
              userId: userData.id,
              userName: userData.name,
              hasStoredPassword: !!userStoredPassword,
              passwordChanged: userData.password_changed,
              inputPassword: password,
              correctPassword: correctPassword
            });

            if (password === correctPassword) {
              // Successful authentication
              response = {
                success: true,
                data: {
                  user: userData,
                  token: `mock_token_${userData.id}_${Date.now()}`,
                  loginType: 'supabase_mock'
                }
              };
              console.log('✅ Using Supabase mock authentication for user:', userData.name);
            } else {
              throw new Error('Mật khẩu không đúng');
            }
          } else {
            // Try real Supabase Auth for other users
            const supabaseResponse = await supabaseService.signIn(email, password);

            if (supabaseResponse.data && !supabaseResponse.error) {
              // Get user data from Supabase users table
              const realUserData = await supabaseService.getUserByEmail(email);

              if (realUserData) {
                response = {
                  success: true,
                  data: {
                    user: realUserData,
                    token: supabaseResponse.data.session?.access_token || '',
                    loginType: 'supabase'
                  }
                };
                console.log('✅ Using real Supabase authentication');
              } else {
                throw new Error('User data not found in Supabase');
              }
            } else {
              throw new Error(supabaseResponse.error || 'Email không tồn tại trong hệ thống');
            }
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase authentication failed:', supabaseError);
          throw supabaseError; // Don't fallback to API, throw error directly
        }
      }

      // Fallback to mock authentication if Supabase not configured
      if (!response) {
        console.log('⚠️ Supabase not configured, using mock authentication');
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

      // Handle first login workflow - REMOVED ADMIN EXCEPTION
      // REMOVED: Special treatment for Khổng Đức Mạnh
      // ALL users must change password on first login
      const isFirstLogin = !user.password_changed;
      const needsPasswordChange = isFirstLogin || requiresPasswordChange;

      console.log('🔍 [AuthContext] Login - password change check:', {
        userId: user.id,
        userName: user.name,
        passwordChanged: user.password_changed,
        isFirstLogin,
        requiresPasswordChange,
        needsPasswordChange
      });

      setIsFirstLogin(isFirstLogin);
      setRequirePasswordChange(needsPasswordChange);

      // Block app access if password change is required for ALL users
      if (needsPasswordChange) {
        setBlockAppAccess(true);
        console.log('🚫 Blocking app access - password change required for user:', user.name, {
          isFirstLogin,
          requiresPasswordChange,
          needsPasswordChange,
          loginType: responseLoginType
        });
      } else {
        setBlockAppAccess(false);
        console.log('✅ App access allowed for user:', user.name, '(password already changed)');
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

      // Clear logout flag
      sessionStorage.removeItem('justLoggedOut');

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

        // Auto sync local tasks to Supabase
        try {
          console.log('🚀 Starting auto sync of local tasks to Supabase...');
          const autoSyncService = LocalToSupabaseAutoSync.getInstance();
          const syncResult = await autoSyncService.autoSyncOnLogin(user.id, user.name);

          if (syncResult.success && syncResult.syncedCount > 0) {
            toast({
              title: 'Đồng bộ thành công',
              description: `Đã đồng bộ ${syncResult.syncedCount} công việc lên cloud`,
              variant: 'default',
            });
            console.log(`✅ Auto synced ${syncResult.syncedCount} tasks to Supabase`);
          } else if (syncResult.errorCount > 0) {
            console.warn('⚠️ Some tasks failed to sync:', syncResult.errors);
            toast({
              title: 'Đồng bộ một phần',
              description: `Đã đồng bộ ${syncResult.syncedCount}/${syncResult.syncedCount + syncResult.errorCount} công việc`,
              variant: 'default',
            });
          }
        } catch (syncError) {
          console.error('❌ Auto sync failed:', syncError);
          // Don't show error toast for sync failure to avoid disrupting login flow
        }
      }

      // Show appropriate toast message only for password change requirement
      if (requiresPasswordChange) {
        toast({
          title: 'Đăng nhập lần đầu',
          description: 'Vui lòng đổi mật khẩu để tiếp tục',
          variant: 'default',
        });
      }
      // Removed success login toast

      return Promise.resolve();
    } catch (error) {
      let errorMessage = 'Đã xảy ra lỗi không xác định';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Clean up error message - remove HTTP status and JSON structure
        if (errorMessage.includes('HTTP 401:') || errorMessage.includes('HTTP 400:')) {
          const jsonMatch = errorMessage.match(/\{"success":false,"error":"([^"]+)"\}/);
          if (jsonMatch && jsonMatch[1]) {
            errorMessage = jsonMatch[1];
          } else {
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

  const logout = async () => {
    console.log('🚪 Logging out user');

    // Set logout flag to prevent session restore
    setIsLoggingOut(true);

    // Stop auto plan sync service
    autoPlanSyncService.stopAutoSync();
    console.log('⏹️ Stopped auto plan sync');

    // Sign out from Supabase if configured
    const supabaseService = SupabaseService.getInstance();
    if (supabaseService.isInitialized()) {
      try {
        await supabaseService.signOut();
        console.log('✅ Signed out from Supabase');
      } catch (error) {
        console.warn('⚠️ Error signing out from Supabase:', error);
      }
    }

    // Reset all auth states IMMEDIATELY
    setCurrentUser(null);
    setAuthToken(null);
    setIsFirstLogin(false);
    setRequirePasswordChange(false);
    setBlockAppAccess(false);
    setLoginType(null);

    // Preserve stored passwords before clearing localStorage
    const storedPasswords: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_password_')) {
        storedPasswords[key] = localStorage.getItem(key) || '';
      }
    }

    // Clear ALL localStorage and sessionStorage items
    localStorage.clear(); // Clear everything to be safe
    sessionStorage.clear(); // Clear everything to be safe

    // Restore stored passwords - they should persist across sessions
    Object.entries(storedPasswords).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Set logout flag again after clearing
    sessionStorage.setItem('justLoggedOut', 'true');

    console.log('🧹 Cleared localStorage and sessionStorage, preserved', Object.keys(storedPasswords).length, 'stored passwords');
    console.log('👤 Current user after logout:', null);

    toast({
      title: 'Đăng xuất thành công',
      description: 'Bạn đã đăng xuất khỏi hệ thống',
    });

    // Force redirect to login page immediately
    // Use replace to prevent back button issues
    window.location.replace('/login');
  };

  // Emergency logout function for debugging
  const emergencyLogout = () => {
    console.log('🚨 Emergency logout triggered');

    // Preserve stored passwords before clearing localStorage
    const storedPasswords: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_password_')) {
        storedPasswords[key] = localStorage.getItem(key) || '';
      }
    }

    localStorage.clear();
    sessionStorage.clear();

    // Restore stored passwords
    Object.entries(storedPasswords).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('✅ Emergency logout completed, preserved', Object.keys(storedPasswords).length, 'stored passwords');
    sessionStorage.setItem('justLoggedOut', 'true');
    window.location.replace('/login');
  };

  // Manual login function for debugging
  const manualLogin = async () => {
    console.log('🔧 Manual login triggered');
    try {
      // Use correct email from current user
      await login('manh.khong@example.com', '123456');
    } catch (error) {
      console.error('❌ Manual login failed:', error);
    }
  };

  // Force refresh function
  const forceRefresh = () => {
    console.log('🔄 Force refreshing app...');
    window.location.reload();
  };

  // Force reset auth state function
  const forceResetAuthState = () => {
    console.log('🔧 Force resetting auth state...');
    if (currentUser && currentUser.password_changed) {
      setIsFirstLogin(false);
      setRequirePasswordChange(false);
      setBlockAppAccess(false);
      console.log('✅ Auth state reset completed');
    } else {
      console.log('❌ Cannot reset - no current user or password not changed');
    }
  };

  // Expose debug functions to window
  useEffect(() => {
    (window as any).emergencyLogout = emergencyLogout;
    (window as any).manualLogin = manualLogin;
    (window as any).forceRefresh = forceRefresh;
    (window as any).forceResetAuthState = forceResetAuthState;
    (window as any).checkLocalStorage = () => {
      console.log('🔍 Current localStorage:', {
        currentUser: localStorage.getItem('currentUser'),
        authToken: localStorage.getItem('authToken'),
        loginType: localStorage.getItem('loginType')
      });
    };
    (window as any).debugPasswordStatus = (userId?: string) => {
      const targetUserId = userId || currentUser?.id;
      if (targetUserId) {
        return debugUserPasswordStatus(targetUserId);
      } else {
        console.log('❌ No user ID provided and no current user');
        return null;
      }
    };
    (window as any).debugListAllUsers = debugListAllUsers;
    (window as any).debugCurrentUser = () => {
      console.log('👤 Current user:', currentUser);
      if (currentUser) {
        return debugUserPasswordStatus(currentUser.id);
      }
      return null;
    };
    (window as any).fixUserDataConsistency = fixUserDataConsistency;
    (window as any).debugAllStoredPasswords = debugAllStoredPasswords;
    (window as any).debugLocalStorageAccess = debugLocalStorageAccess;
    (window as any).getStoredPassword = getStoredPassword;
    (window as any).restoreStoredPassword = restoreStoredPassword;
    (window as any).autoRestoreKnownPasswords = autoRestoreKnownPasswords;
    (window as any).resetAllPasswordsToDefault = resetAllPasswordsToDefault;
    (window as any).disablePasswordResetMode = disablePasswordResetMode;
    (window as any).ultimatePasswordReset = ultimatePasswordReset;
    (window as any).syncPasswordResetToSupabase = syncPasswordResetToSupabase;
    (window as any).syncPasswordChangeToSupabase = syncPasswordChangeToSupabase;
    (window as any).updateAllUsersPasswordChangedToFalse = updateAllUsersPasswordChangedToFalse;
    (window as any).ensurePasswordColumnInSupabase = ensurePasswordColumnInSupabase;
    (window as any).addPasswordColumnToSupabaseSQL = addPasswordColumnToSupabaseSQL;
    (window as any).testCompletePasswordSyncFlow = testCompletePasswordSyncFlow;
    (window as any).fixPasswordChangeRequirement = fixPasswordChangeRequirement;
    (window as any).forceResetManhPasswordChanged = forceResetManhPasswordChanged;

    // Expose individual debug functions directly
    (window as any).debugUserPasswordStatus = debugUserPasswordStatus;
    (window as any).debugAuthState = () => {
      console.log('🔍 Current Auth State:', {
        currentUser: currentUser?.name || 'null',
        isAuthenticated: !!currentUser && !blockAppAccess,
        isFirstLogin,
        requirePasswordChange,
        blockAppAccess,
        isLoading,
        authToken: !!authToken,
        loginType
      });
      return {
        currentUser: currentUser?.name || 'null',
        isAuthenticated: !!currentUser && !blockAppAccess,
        isFirstLogin,
        requirePasswordChange,
        blockAppAccess,
        isLoading,
        authToken: !!authToken,
        loginType
      };
    };

    console.log('🔧 Debug functions exposed:');
    console.log('  - window.emergencyLogout()');
    console.log('  - window.manualLogin()');
    console.log('  - window.checkLocalStorage()');
    console.log('  - window.forceRefresh()');
    console.log('  - window.forceResetAuthState()');
    console.log('  - window.debugPasswordStatus(userId?)');
    console.log('  - window.debugUserPasswordStatus(userId)');
    console.log('  - window.debugListAllUsers()');
    console.log('  - window.debugCurrentUser()');
    console.log('  - window.debugAllStoredPasswords()');
    console.log('  - window.debugLocalStorageAccess(userId)');
    console.log('  - window.restoreStoredPassword(userId, password)');
    console.log('  - window.autoRestoreKnownPasswords()');
    console.log('  - window.resetAllPasswordsToDefault() - RESET ALL TO 123456');
    console.log('  - window.ultimatePasswordReset() - ULTIMATE RESET + RELOAD + SUPABASE');
    console.log('  - window.syncPasswordResetToSupabase() - SYNC RESET TO SUPABASE');
    console.log('  - window.syncPasswordChangeToSupabase(userId, newPassword) - SYNC CHANGE TO SUPABASE');
    console.log('  - window.updateAllUsersPasswordChangedToFalse() - SET ALL USERS password_changed=false');
    console.log('  - window.ensurePasswordColumnInSupabase() - ADD PASSWORD COLUMN TO SUPABASE');
    console.log('  - window.addPasswordColumnToSupabaseSQL() - ADD PASSWORD COLUMN VIA SQL');
    console.log('  - window.testCompletePasswordSyncFlow() - TEST COMPLETE SYNC FLOW');
    console.log('  - window.fixPasswordChangeRequirement() - FIX PASSWORD CHANGE REQUIREMENT');
    console.log('  - window.forceResetManhPasswordChanged() - FORCE RESET MẠNH PASSWORD_CHANGED');
    console.log('  - window.disablePasswordResetMode() - ALLOW AUTO-RESTORE AGAIN');
    console.log('  - window.fixUserDataConsistency()');
    console.log('  - window.debugAuthState()');
  }, [currentUser]);

  const changePassword = async (newPassword: string) => {
    if (!currentUser) {
      console.error('❌ [AuthContext] changePassword: No current user');
      throw new Error('Không có người dùng hiện tại');
    }

    try {
      console.log('🔄 [AuthContext] changePassword: Starting for user:', {
        userId: currentUser.id,
        userName: currentUser.name,
        newPasswordLength: newPassword?.length
      });

      // Try mock change password first (since we're using mock auth)
      console.log('🔄 [AuthContext] changePassword: Calling mockChangePassword...');
      const mockResponse = await mockChangePassword(currentUser.id, newPassword);
      console.log('📥 [AuthContext] changePassword: Mock response:', mockResponse);

      if (mockResponse.success) {
        console.log('✅ [AuthContext] changePassword: Mock response successful, updating user state...');

        // Update current user state
        const updatedUser = { ...currentUser, password_changed: true };
        setCurrentUser(updatedUser);

        // Reset first login states
        setIsFirstLogin(false);
        setRequirePasswordChange(false);
        setBlockAppAccess(false);

        console.log('✅ [AuthContext] changePassword: Updated auth states:', {
          isFirstLogin: false,
          requirePasswordChange: false,
          blockAppAccess: false
        });

        // Force a state check after a short delay to ensure states are updated
        setTimeout(() => {
          console.log('🔍 [AuthContext] State check after password change:', {
            currentUser: !!currentUser,
            isFirstLogin,
            requirePasswordChange,
            blockAppAccess,
            isAuthenticated: !!currentUser && !blockAppAccess
          });
        }, 100);

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('✅ [AuthContext] changePassword: Updated localStorage');

        // Start auto plan sync service now that password is changed
        autoPlanSyncService.startAutoSync(currentUser.id);
        console.log('🔄 [AuthContext] changePassword: Started auto plan sync after password change');

        toast({
          title: 'Đổi mật khẩu thành công',
          description: 'Mật khẩu của bạn đã được cập nhật. Bạn có thể sử dụng ứng dụng ngay bây giờ.',
        });

        console.log('✅ [AuthContext] changePassword: Password change completed successfully');
      } else {
        console.error('❌ [AuthContext] changePassword: Mock response failed:', mockResponse.error);
        throw new Error(mockResponse.error || 'Mock change password failed');
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

      // Try to update via Supabase first if configured
      const supabaseService = SupabaseService.getInstance();
      if (supabaseService.isInitialized()) {
        const success = await supabaseService.updateDocument('users', currentUser.id, userData);
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

      // Fallback to API if Supabase is not configured or fails
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
