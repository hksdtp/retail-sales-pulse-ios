/**
 * Google API Initialization Script with CSP Bypass
 * This script loads Google APIs in the correct order and handles initialization
 */

(function() {
  'use strict';

  // CRITICAL: Bypass CSP for Google APIs
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    console.log('🔓 Bypassing CSP restrictions for Google APIs...');

    // Remove any existing restrictive CSP meta tags
    const cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    cspMetas.forEach(meta => {
      if (meta.content && !meta.content.includes('unsafe-inline')) {
        console.log('🗑️ Removing restrictive CSP:', meta.content.substring(0, 100) + '...');
        meta.remove();
      }
    });

    // Ensure we have a permissive CSP
    const hasPermissiveCSP = Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'))
      .some(meta => meta.content && meta.content.includes('unsafe-inline'));

    if (!hasPermissiveCSP) {
      const newCSP = document.createElement('meta');
      newCSP.setAttribute('http-equiv', 'Content-Security-Policy');
      newCSP.setAttribute('content', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src *; media-src *; object-src *; child-src *; frame-src *; worker-src *; frame-ancestors *; form-action *; base-uri *;");
      document.head.appendChild(newCSP);
      console.log('✅ Added ultra-permissive CSP for Google APIs');
    }
  }

  console.log('🔄 Starting Google API initialization...');

  // Configuration - Use alternative discovery docs to avoid 502 errors
  const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://content.googleapis.com/discovery/v1/apis/drive/v3/rest', // Alternative endpoint
  ];
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';

  // Global state
  window.googleApiState = {
    isLoaded: false,
    isInitialized: false,
    error: null,
    clientId: null,
    apiKey: null
  };

  /**
   * Initialize Google API client
   */
  async function initializeGapi() {
    try {
      console.log('🔄 Initializing gapi client...');
      
      // Wait for gapi to be available
      if (typeof gapi === 'undefined') {
        throw new Error('gapi is not loaded');
      }

      // Load client and auth2
      await new Promise((resolve, reject) => {
        gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      console.log('✅ gapi client loaded successfully');
      window.googleApiState.isLoaded = true;
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize gapi:', error);
      window.googleApiState.error = error.message;
      return false;
    }
  }

  /**
   * Setup Google API with credentials - NEW APPROACH
   */
  async function setupGoogleApi(apiKey, clientId) {
    try {
      console.log('🔄 Setting up Google API with credentials...');
      console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
      console.log('🆔 Client ID:', clientId.substring(0, 20) + '...');

      if (!window.googleApiState.isLoaded) {
        const loaded = await initializeGapi();
        if (!loaded) {
          throw new Error('Failed to load gapi');
        }
      }

      // Validate credentials format
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid API Key format. Must start with "AIza"');
      }

      if (!clientId.includes('.apps.googleusercontent.com')) {
        throw new Error('Invalid Client ID format. Must end with ".apps.googleusercontent.com"');
      }

      // Try multiple discovery docs to avoid 502 errors
      let initSuccess = false;
      let lastError = null;

      for (const discoveryDoc of DISCOVERY_DOCS) {
        try {
          console.log('🔄 Trying discovery doc:', discoveryDoc);

          const initConfig = {
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: [discoveryDoc],
            scope: SCOPES,
            // Add explicit hosted domain configuration
            hosted_domain: undefined,
            // Ensure proper cookie policy
            cookie_policy: 'single_host_origin'
          };

          console.log('🔧 Initializing with config:', {
            ...initConfig,
            apiKey: apiKey.substring(0, 10) + '...',
            clientId: clientId.substring(0, 20) + '...',
            discoveryDoc: discoveryDoc
          });

          await gapi.client.init(initConfig);
          console.log('✅ Successfully initialized with:', discoveryDoc);
          initSuccess = true;
          break;
        } catch (error) {
          console.warn('⚠️ Failed with discovery doc:', discoveryDoc, error.message);
          lastError = error;
          continue;
        }
      }

      if (!initSuccess) {
        throw lastError || new Error('All discovery docs failed');
      }

      console.log('✅ Google API client initialized successfully');

      window.googleApiState.isInitialized = true;
      window.googleApiState.clientId = clientId;
      window.googleApiState.apiKey = apiKey;

      return true;
    } catch (error) {
      console.error('❌ Failed to setup Google API:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      window.googleApiState.error = error.message;
      return false;
    }
  }

  /**
   * Sign in to Google
   */
  async function signIn() {
    try {
      console.log('🔄 Signing in to Google...');
      
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Auth instance not available');
      }

      const user = await authInstance.signIn();
      console.log('✅ Signed in successfully:', user.getBasicProfile().getEmail());
      
      return user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is signed in
   */
  function isSignedIn() {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      return authInstance && authInstance.isSignedIn.get();
    } catch (error) {
      console.error('❌ Error checking sign in status:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  function getCurrentUser() {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance && authInstance.isSignedIn.get()) {
        return authInstance.currentUser.get();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * Comprehensive error diagnosis
   */
  function diagnoseErrors() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      gapi: typeof gapi !== 'undefined',
      gapiClient: typeof gapi?.client !== 'undefined',
      gapiAuth2: typeof gapi?.auth2 !== 'undefined',
      state: window.googleApiState,
      consoleErrors: []
    };

    console.log('🔍 Google API Diagnosis:', diagnosis);
    return diagnosis;
  }

  /**
   * Force clean reload of Google APIs
   */
  async function forceCleanReload() {
    try {
      console.log('🔄 Force cleaning and reloading Google APIs...');

      // Reset state
      window.googleApiState = {
        isLoaded: false,
        isInitialized: false,
        error: null,
        clientId: null,
        apiKey: null
      };

      // Remove existing gapi
      if (window.gapi) {
        delete window.gapi;
      }

      // Remove existing scripts
      const scripts = document.querySelectorAll('script[src*="googleapis.com"], script[src*="google.com"], script[src*="gstatic.com"]');
      scripts.forEach(script => {
        console.log('🗑️ Removing script:', script.src);
        script.remove();
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reload scripts
      await loadScript('https://apis.google.com/js/api.js');
      await waitForGapi();

      console.log('✅ Clean reload completed');
      return true;
    } catch (error) {
      console.error('❌ Clean reload failed:', error);
      return false;
    }
  }

  // Expose functions globally
  window.googleApiHelper = {
    initializeGapi,
    setupGoogleApi,
    signIn,
    isSignedIn,
    getCurrentUser,
    getState: () => window.googleApiState,
    diagnoseErrors,
    forceCleanReload
  };

  // Auto-initialize when gapi is loaded
  function checkGapiLoaded() {
    if (typeof gapi !== 'undefined') {
      console.log('✅ gapi detected, auto-initializing...');
      initializeGapi();
    } else {
      console.log('⏳ Waiting for gapi to load...');
      setTimeout(checkGapiLoaded, 100);
    }
  }

  // Start checking for gapi
  checkGapiLoaded();

  console.log('✅ Google API helper loaded');
})();
