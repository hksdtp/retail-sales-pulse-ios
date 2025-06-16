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
  private static readonly CURRENT_VERSION = '1.2.0';
  private static readonly BUILD_TIME = new Date().toISOString();

  // Danh sách tính năng mới trong version này
  private static readonly CURRENT_FEATURES = [
    'Fixed task form dialog layout',
    'Updated Plans to Tasks sync',
    'Enhanced Plan creation UI',
    'Added debug sync tools',
    'Improved mobile responsiveness'
  ];

  /**
   * Kiểm tra và cập nhật version
   */
  public static checkVersion(): boolean {
    const storedVersion = this.getStoredVersion();
    const currentVersion = this.getCurrentVersion();

    if (!storedVersion || storedVersion.version !== currentVersion.version) {
      console.log('🔄 Version update detected:', {
        old: storedVersion?.version || 'unknown',
        new: currentVersion.version
      });

      // Lưu version mới
      this.saveVersion(currentVersion);

      // Clear cache nếu cần
      this.clearOldCache();

      // Hiển thị thông báo update
      this.showUpdateNotification(currentVersion);

      return true; // Version đã thay đổi
    }

    return false; // Version không đổi
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
