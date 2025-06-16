/**
 * Cache Helper - Hỗ trợ quản lý cache và force refresh
 */

export class CacheHelper {
  /**
   * Hiển thị hướng dẫn force refresh cho user
   */
  public static showRefreshInstructions(): void {
    const instructions = `
🔄 HƯỚNG DẪN FORCE REFRESH

Nếu bạn vẫn thấy giao diện cũ, hãy thực hiện:

📱 MOBILE:
• Chrome/Edge: Menu (⋮) → Settings → Privacy → Clear browsing data
• Safari: Settings → Safari → Clear History and Website Data
• Firefox: Menu (⋮) → Settings → Delete browsing data

💻 DESKTOP:
• Chrome/Edge: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
• Firefox: Ctrl+F5 hoặc Cmd+Shift+R
• Safari: Cmd+Option+R

🔧 NÂNG CAO:
• Mở DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"
• Hoặc nhấn nút "Làm mới" trong thông báo cập nhật

✅ Sau khi làm mới, bạn sẽ thấy giao diện mới!
    `;

    console.log(instructions);
    
    // Hiển thị alert với instructions
    if (confirm('🔄 Phát hiện giao diện cũ!\n\nBạn có muốn xem hướng dẫn force refresh không?')) {
      alert(instructions);
    }
  }

  /**
   * Kiểm tra xem user có đang dùng cache cũ không
   */
  public static detectOldCache(): boolean {
    try {
      // Kiểm tra version trong meta tag
      const metaVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
      const currentVersion = '1.2.0';
      
      if (!metaVersion || metaVersion !== currentVersion) {
        console.warn('🚨 Detected old cache - meta version mismatch:', { metaVersion, currentVersion });
        return true;
      }

      // Kiểm tra localStorage version
      const storedVersion = localStorage.getItem('app_version');
      if (storedVersion) {
        const parsed = JSON.parse(storedVersion);
        if (parsed.version !== currentVersion) {
          console.warn('🚨 Detected old cache - localStorage version mismatch:', parsed.version);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error detecting cache:', error);
      return false;
    }
  }

  /**
   * Auto-detect và hiển thị hướng dẫn nếu cần
   */
  public static autoDetectAndGuide(): void {
    setTimeout(() => {
      if (this.detectOldCache()) {
        this.showRefreshInstructions();
      }
    }, 2000); // Delay 2s để page load xong
  }

  /**
   * Tạo cache buster URL
   */
  public static addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=1.2.0&t=${Date.now()}`;
  }

  /**
   * Clear specific cache keys
   */
  public static clearSpecificCache(patterns: string[]): void {
    patterns.forEach(pattern => {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Cleared cache: ${key}`);
        }
      });
    });
  }

  /**
   * Force reload với cache clear
   */
  public static forceReload(): void {
    // Clear cache trước khi reload
    this.clearSpecificCache(['ui_', 'component_', 'cache_']);
    
    // Reload với cache busting
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', Date.now().toString());
    window.location.href = url.toString();
  }

  /**
   * Kiểm tra browser support cho cache APIs
   */
  public static checkCacheSupport(): {
    localStorage: boolean;
    sessionStorage: boolean;
    caches: boolean;
    serviceWorker: boolean;
  } {
    return {
      localStorage: typeof Storage !== 'undefined' && !!window.localStorage,
      sessionStorage: typeof Storage !== 'undefined' && !!window.sessionStorage,
      caches: 'caches' in window,
      serviceWorker: 'serviceWorker' in navigator
    };
  }

  /**
   * Log cache info for debugging
   */
  public static logCacheInfo(): void {
    const support = this.checkCacheSupport();
    const version = localStorage.getItem('app_version');
    
    console.group('🔍 Cache Information');
    console.log('Browser Support:', support);
    console.log('Stored Version:', version ? JSON.parse(version) : 'None');
    console.log('Meta Version:', document.querySelector('meta[name="app-version"]')?.getAttribute('content'));
    console.log('LocalStorage Keys:', Object.keys(localStorage).filter(k => k.includes('cache') || k.includes('version')));
    console.groupEnd();
  }
}

// Auto-run detection
document.addEventListener('DOMContentLoaded', () => {
  CacheHelper.autoDetectAndGuide();
  CacheHelper.logCacheInfo();
});

// Export cho global access
(window as any).CacheHelper = CacheHelper;
