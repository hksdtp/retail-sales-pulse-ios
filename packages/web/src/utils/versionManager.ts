/**
 * Version Manager - Quản lý phiên bản và cache busting
 */

export interface AppVersion {
  version: string;
  buildTime: string;
  features: string[];
}

export class VersionManager {
  private static readonly VERSION_KEY = 'app_version';
  private static readonly CURRENT_VERSION = '1.3.0'; // Tăng version để force refresh
  private static readonly BUILD_TIME = new Date().toISOString();
  private static readonly FORCE_REFRESH_VERSION = '1.3.0'; // Version bắt buộc refresh

  // Danh sách tính năng mới trong version này
  private static readonly CURRENT_FEATURES = [
    'Fixed task form dialog layout',
    'Updated Plans to Tasks sync',
    'Enhanced Plan creation UI',
    'Added image upload to tasks',
    'Google Drive integration',
    'Force refresh for all users',
    'Improved cache management'
  ];

  /**
   * Kiểm tra và cập nhật version
   */
  public static checkVersion(): boolean {
    const storedVersion = this.getStoredVersion();
    const currentVersion = this.getCurrentVersion();

    // Kiểm tra force refresh version
    const needsForceRefresh = this.needsForceRefresh(storedVersion);

    if (!storedVersion || storedVersion.version !== currentVersion.version || needsForceRefresh) {
      console.log('🔄 Version update detected:', {
        old: storedVersion?.version || 'unknown',
        new: currentVersion.version,
        forceRefresh: needsForceRefresh
      });

      // Lưu version mới
      this.saveVersion(currentVersion);

      // Clear cache nếu cần
      this.clearOldCache();

      // Force refresh nếu cần thiết
      if (needsForceRefresh) {
        this.showForceRefreshNotification(currentVersion);
        setTimeout(() => {
          this.forceRefresh();
        }, 3000); // Delay 3s để user đọc thông báo
        return true;
      }

      // Hiển thị thông báo update bình thường
      this.showUpdateNotification(currentVersion);

      return true; // Version đã thay đổi
    }

    return false; // Version không đổi
  }

  /**
   * Kiểm tra có cần force refresh không
   */
  private static needsForceRefresh(storedVersion: AppVersion | null): boolean {
    if (!storedVersion) return true; // User mới -> force refresh

    // So sánh với FORCE_REFRESH_VERSION
    const storedVersionNum = this.parseVersion(storedVersion.version);
    const forceVersionNum = this.parseVersion(this.FORCE_REFRESH_VERSION);

    return storedVersionNum < forceVersionNum;
  }

  /**
   * Parse version string thành number để so sánh
   */
  private static parseVersion(version: string): number {
    const parts = version.split('.').map(Number);
    return parts[0] * 10000 + parts[1] * 100 + (parts[2] || 0);
  }

  /**
   * Lấy version hiện tại
   */
  public static getCurrentVersion(): AppVersion {
    return {
      version: this.CURRENT_VERSION,
      buildTime: this.BUILD_TIME,
      features: this.CURRENT_FEATURES
    };
  }

  /**
   * Lấy version đã lưu
   */
  private static getStoredVersion(): AppVersion | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored version:', error);
      return null;
    }
  }

  /**
   * Lưu version
   */
  private static saveVersion(version: AppVersion): void {
    try {
      localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
    } catch (error) {
      console.error('Error saving version:', error);
    }
  }

  /**
   * Clear cache cũ
   */
  private static clearOldCache(): void {
    try {
      // Clear service worker cache nếu có
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('old') || cacheName.includes('v1')) {
              caches.delete(cacheName);
            }
          });
        });
      }

      // Clear một số cache keys cũ
      const keysToCheck = [
        'tasks_cache',
        'plans_cache',
        'ui_cache',
        'component_cache'
      ];

      keysToCheck.forEach(key => {
        const pattern = new RegExp(`^${key}_`);
        Object.keys(localStorage).forEach(storageKey => {
          if (pattern.test(storageKey)) {
            const item = localStorage.getItem(storageKey);
            if (item) {
              try {
                const parsed = JSON.parse(item);
                if (parsed.version && parsed.version !== this.CURRENT_VERSION) {
                  localStorage.removeItem(storageKey);
                  console.log(`🗑️ Cleared old cache: ${storageKey}`);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        });
      });

    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Hiển thị thông báo force refresh
   */
  private static showForceRefreshNotification(version: AppVersion): void {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = 'fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4';
    notification.innerHTML = `
      <div class="bg-gradient-to-br from-red-600 via-orange-600 to-red-700 text-white p-8 rounded-2xl shadow-2xl max-w-md text-center animate-pulse">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold mb-2">🚀 Cập nhật quan trọng!</h2>
        <p class="text-sm mb-4">Version ${version.version} yêu cầu làm mới toàn bộ ứng dụng</p>
        <p class="text-xs text-red-100">Đang tự động làm mới trong 3 giây...</p>
        <div class="mt-4 bg-white/20 rounded-full h-2">
          <div class="bg-white rounded-full h-2 animate-pulse" style="width: 100%"></div>
        </div>
      </div>
    `;

    // Thêm vào DOM
    document.body.appendChild(notification);
  }

  /**
   * Hiển thị thông báo update
   */
  private static showUpdateNotification(version: AppVersion): void {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl max-w-sm animate-in slide-in-from-right duration-500';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-sm">Cập nhật thành công!</h4>
          <p class="text-xs text-blue-100 mt-1">Version ${version.version}</p>
          <div class="mt-2">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    class="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>
    `;

    // Thêm vào DOM
    document.body.appendChild(notification);

    // Tự động xóa sau 5 giây
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Force refresh toàn bộ app
   */
  public static forceRefresh(): void {
    console.log('🔄 Force refreshing application...');
    
    // Clear tất cả cache
    this.clearAllCache();
    
    // Reload page
    window.location.reload();
  }

  /**
   * Clear tất cả cache
   */
  private static clearAllCache(): void {
    try {
      // Clear localStorage (trừ user data quan trọng)
      const importantKeys = ['auth_token', 'user_profile', 'tasks_', 'personal_plans_'];
      const keysToKeep: string[] = [];
      
      Object.keys(localStorage).forEach(key => {
        if (importantKeys.some(important => key.includes(important))) {
          keysToKeep.push(key);
        }
      });

      localStorage.clear();
      
      // Restore important data
      keysToKeep.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
          localStorage.setItem(key, value);
        }
      });

      // Clear service worker cache
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => caches.delete(cacheName));
        });
      }

    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  /**
   * Get cache buster string
   */
  public static getCacheBuster(): string {
    return `v=${this.CURRENT_VERSION}&t=${Date.now()}`;
  }
}

// Auto-check version khi load
document.addEventListener('DOMContentLoaded', () => {
  VersionManager.checkVersion();
});

// Export cho global access
(window as any).VersionManager = VersionManager;
