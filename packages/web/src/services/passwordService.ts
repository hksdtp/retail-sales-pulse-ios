// Service để quản lý mật khẩu người dùng
export interface UserPassword {
  userId: string;
  hashedPassword: string;
  isFirstLogin: boolean;
  lastChanged: string;
}

class PasswordService {
  private readonly STORAGE_KEY = 'user_passwords';
  private readonly DEFAULT_PASSWORD = '123456';

  // Lấy tất cả mật khẩu đã lưu
  private getStoredPasswords(): Record<string, UserPassword> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored passwords:', error);
      return {};
    }
  }

  // Lưu mật khẩu vào localStorage
  private savePasswords(passwords: Record<string, UserPassword>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(passwords));
    } catch (error) {
      console.error('Error saving passwords:', error);
    }
  }

  // Hash mật khẩu đơn giản (trong production nên dùng bcrypt)
  private hashPassword(password: string): string {
    // Đây là hash đơn giản, trong thực tế nên dùng bcrypt hoặc tương tự
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Kiểm tra xem user có phải lần đăng nhập đầu tiên không
  isFirstLogin(userId: string): boolean {
    const passwords = this.getStoredPasswords();
    const userPassword = passwords[userId];

    // Nếu chưa có record hoặc isFirstLogin = true
    return !userPassword || userPassword.isFirstLogin;
  }

  // Xác thực mật khẩu - ALWAYS CHECK SUPABASE FIRST
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    console.log('🔐 [PasswordService] verifyPassword called:', { userId, password: '***' });

    try {
      // STEP 1: Check Supabase database first (single source of truth)
      const { SupabaseService } = await import('@/services/SupabaseService');
      const supabaseClient = SupabaseService.getInstance().getClient();

      if (supabaseClient) {
        
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('id, password, password_changed')
          .eq('id', userId)
          .single();

        if (!error && user) {
          console.log('✅ [PasswordService] Found user in Supabase:', {
            id: user.id,
            password: user.password,
            password_changed: user.password_changed
          });

          // Use Supabase data for validation
          if (user.password_changed === false) {
            // User hasn't changed password, accept default
            const isValid = password === this.DEFAULT_PASSWORD;
            
            return isValid;
          } else {
            // User has changed password, check against stored password
            const isValid = password === user.password;
            
            return isValid;
          }
        } else {
          console.warn('⚠️ [PasswordService] User not found in Supabase, falling back to localStorage');
        }
      }
    } catch (supabaseError) {
      console.warn('⚠️ [PasswordService] Supabase check failed, falling back to localStorage:', supabaseError);
    }

    // STEP 2: Fallback to localStorage (legacy behavior)
    console.log('🔄 [PasswordService] Using localStorage fallback...');
    const passwords = this.getStoredPasswords();
    const userPassword = passwords[userId];

    // Nếu là lần đầu đăng nhập, kiểm tra mật khẩu mặc định
    if (!userPassword || userPassword.isFirstLogin) {
      const isValid = password === this.DEFAULT_PASSWORD;
      
      return isValid;
    }

    // Kiểm tra mật khẩu đã hash
    const hashedInput = this.hashPassword(password);
    const isValid = hashedInput === userPassword.hashedPassword;
    
    return isValid;
  }

  // Đổi mật khẩu cho user - SYNC WITH SUPABASE
  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      console.log('🔄 [PasswordService] changePassword called:', { userId, newPassword: '***' });

      // STEP 1: Update Supabase database first
      try {
        const { SupabaseService } = await import('@/services/SupabaseService');
        const supabaseClient = SupabaseService.getInstance().getClient();

        if (supabaseClient) {
          console.log('🔄 [PasswordService] Updating password in Supabase...');
          const { error } = await supabaseClient
            .from('users')
            .update({
              password: newPassword,
              password_changed: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('❌ [PasswordService] Supabase update failed:', error);
          } else {
            
          }
        }
      } catch (supabaseError) {
        console.warn('⚠️ [PasswordService] Supabase update failed:', supabaseError);
      }

      // STEP 2: Update localStorage (for backward compatibility)
      const passwords = this.getStoredPasswords();
      const hashedPassword = this.hashPassword(newPassword);

      passwords[userId] = {
        userId,
        hashedPassword,
        isFirstLogin: false,
        lastChanged: new Date().toISOString(),
      };

      this.savePasswords(passwords);

      // STEP 3: Clear all password-related caches to force fresh check
      console.log('🧹 [PasswordService] Clearing password caches...');

      // Clear other user password caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_password_') || key.includes('password')) {
          localStorage.removeItem(key);
          console.log(`🗑️ [PasswordService] Cleared cache: ${key}`);
        }
      });

      // Clear current user cache
      localStorage.removeItem('currentUser');

      return true;
    } catch (error) {
      console.error('❌ [PasswordService] Error changing password:', error);
      return false;
    }
  }

  // Lấy thông tin mật khẩu của user
  getUserPasswordInfo(userId: string): UserPassword | null {
    const passwords = this.getStoredPasswords();
    return passwords[userId] || null;
  }

  // Reset mật khẩu về mặc định (cho admin)
  resetPassword(userId: string): boolean {
    try {
      const passwords = this.getStoredPasswords();

      passwords[userId] = {
        userId,
        hashedPassword: this.hashPassword(this.DEFAULT_PASSWORD),
        isFirstLogin: true,
        lastChanged: new Date().toISOString(),
      };

      this.savePasswords(passwords);
      console.log(`Password reset for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  // Xóa tất cả mật khẩu đã lưu (cho development)
  clearAllPasswords(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('All stored passwords cleared');
  }

  // Lấy danh sách users đã đổi mật khẩu
  getUsersWithCustomPasswords(): string[] {
    const passwords = this.getStoredPasswords();
    return Object.keys(passwords).filter((userId) => !passwords[userId].isFirstLogin);
  }

  // Kiểm tra mật khẩu có đủ mạnh không
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.push('Mật khẩu phải có cả chữ và số');
    }

    if (password === this.DEFAULT_PASSWORD) {
      errors.push('Không thể sử dụng mật khẩu mặc định');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
export default passwordService;
