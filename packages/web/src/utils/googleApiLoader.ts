/**
 * Google API Loader - Ensures proper loading and initialization
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export class GoogleApiLoader {
  private static isLoaded = false;
  private static isLoading = false;
  private static loadPromise: Promise<boolean> | null = null;

  /**
   * Load Google APIs if not already loaded
   */
  public static async loadGoogleApis(): Promise<boolean> {
    // If already loaded, return true
    if (this.isLoaded && typeof window.gapi !== 'undefined') {
      return true;
    }

    // If currently loading, wait for existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = this.performLoad();
    
    const result = await this.loadPromise;
    this.isLoading = false;
    this.isLoaded = result;
    
    return result;
  }

  private static async performLoad(): Promise<boolean> {
    try {
      // Check if scripts are already in DOM
      if (typeof window.gapi === 'undefined') {
        console.log('🔄 Loading Google APIs...');
        
        // Load gapi first
        await this.loadScript('https://apis.google.com/js/api.js');
        
        // Wait for gapi to be available
        await this.waitForGapi();

      }

      return true;
    } catch (error) {
      console.error('❌ Failed to load Google APIs:', error);
      return false;
    }
  }

  private static loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Load synchronously for proper order
      script.defer = false;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  }

  private static waitForGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
      const checkGapi = () => {
        attempts++;
        
        if (typeof window.gapi !== 'undefined' && window.gapi.load) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Timeout waiting for gapi to load'));
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      
      checkGapi();
    });
  }

  /**
   * Initialize Google API client
   */
  public static async initializeGapi(): Promise<boolean> {
    try {
      const loaded = await this.loadGoogleApis();
      if (!loaded) {
        return false;
      }

      // Load client and auth2
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google API client:', error);
      return false;
    }
  }

  /**
   * Check if Google APIs are ready
   */
  public static isReady(): boolean {
    return this.isLoaded && 
           typeof window.gapi !== 'undefined' && 
           window.gapi.client && 
           window.gapi.auth2;
  }

  /**
   * Get loading status
   */
  public static getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      isReady: this.isReady(),
      gapiAvailable: typeof window.gapi !== 'undefined',
      clientAvailable: typeof window.gapi?.client !== 'undefined',
      auth2Available: typeof window.gapi?.auth2 !== 'undefined'
    };
  }

  /**
   * Force reload Google APIs
   */
  public static async forceReload(): Promise<boolean> {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    
    // Remove existing scripts
    const scripts = document.querySelectorAll('script[src*="googleapis.com"], script[src*="google.com"]');
    scripts.forEach(script => script.remove());
    
    // Clear gapi from window
    if (window.gapi) {
      delete window.gapi;
    }
    
    return this.loadGoogleApis();
  }
}

// Auto-load on import
GoogleApiLoader.loadGoogleApis().catch(console.error);
