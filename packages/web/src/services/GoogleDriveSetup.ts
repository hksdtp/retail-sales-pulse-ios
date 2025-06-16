/**
 * Google Drive API Setup Service
 */

export interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scopes: string;
}

export class GoogleDriveSetup {
  private static readonly DEFAULT_CONFIG: GoogleDriveConfig = {
    apiKey: 'YOUR_API_KEY_HERE', // Thay bằng API key thật
    clientId: 'YOUR_CLIENT_ID_HERE', // Thay bằng Client ID thật
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    scopes: 'https://www.googleapis.com/auth/drive.file'
  };

  /**
   * Check if Google Drive is properly configured
   */
  public static isProperlyConfigured(config?: Partial<GoogleDriveConfig>): boolean {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    return finalConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
           finalConfig.clientId !== 'YOUR_CLIENT_ID_HERE' &&
           finalConfig.apiKey.length > 10 &&
           finalConfig.clientId.length > 10;
  }

  private static isInitialized = false;
  private static isSignedIn = false;

  /**
   * Initialize Google Drive API
   */
  public static async initialize(config?: Partial<GoogleDriveConfig>): Promise<boolean> {
    try {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

      // Check if properly configured
      if (!this.isProperlyConfigured(config)) {
        console.warn('⚠️ Google Drive API not properly configured. Using placeholder credentials.');
        console.warn('📝 Please configure real API key and Client ID in Google Drive Setup page.');
        return false;
      }

      // Check if gapi is loaded
      if (typeof gapi === 'undefined') {
        console.error('❌ Google API not loaded. Please ensure gapi script is included.');
        return false;
      }

      // Initialize gapi
      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialize the API client
      await gapi.client.init({
        apiKey: finalConfig.apiKey,
        clientId: finalConfig.clientId,
        discoveryDocs: [finalConfig.discoveryDoc],
        scope: finalConfig.scopes
      });

      this.isInitialized = true;
      this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

      console.log('✅ Google Drive API initialized successfully');
      console.log('🔐 Signed in:', this.isSignedIn);

      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  /**
   * Sign in to Google Drive
   */
  public static async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.error('❌ Google Drive API not initialized');
        return false;
      }

      const authInstance = gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      this.isSignedIn = authInstance.isSignedIn.get();
      console.log('✅ Signed in to Google Drive');
      
      return this.isSignedIn;

    } catch (error) {
      console.error('❌ Failed to sign in to Google Drive:', error);
      return false;
    }
  }

  /**
   * Check if user is signed in
   */
  public static isUserSignedIn(): boolean {
    if (!this.isInitialized) return false;
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  /**
   * Get current user info
   */
  public static getCurrentUser(): any {
    if (!this.isInitialized || !this.isSignedIn) return null;
    return gapi.auth2.getAuthInstance().currentUser.get();
  }

  /**
   * Create TaskImages folder if not exists
   */
  public static async createTaskImagesFolder(): Promise<string | null> {
    try {
      if (!this.isUserSignedIn()) {
        console.error('❌ User not signed in to Google Drive');
        return null;
      }

      // Search for existing folder
      const searchResponse = await gapi.client.drive.files.list({
        q: "name='TaskImages' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)'
      });

      if (searchResponse.result.files && searchResponse.result.files.length > 0) {
        const folderId = searchResponse.result.files[0].id!;
        console.log('📁 Found existing TaskImages folder:', folderId);
        return folderId;
      }

      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: 'TaskImages',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      const folderId = createResponse.result.id!;
      console.log('📁 Created new TaskImages folder:', folderId);
      
      return folderId;

    } catch (error) {
      console.error('❌ Failed to create TaskImages folder:', error);
      return null;
    }
  }

  /**
   * Test upload a small file to verify setup
   */
  public static async testUpload(): Promise<boolean> {
    try {
      if (!this.isUserSignedIn()) {
        console.error('❌ User not signed in for test upload');
        return false;
      }

      const folderId = await this.createTaskImagesFolder();
      if (!folderId) {
        console.error('❌ Failed to get/create TaskImages folder');
        return false;
      }

      // Create a test file
      const testContent = 'Test file for Google Drive API setup';
      const testBlob = new Blob([testContent], { type: 'text/plain' });

      const metadata = {
        name: `test_${Date.now()}.txt`,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', testBlob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test upload successful:', result.id);
        
        // Delete test file
        await gapi.client.drive.files.delete({ fileId: result.id });
        console.log('🗑️ Test file deleted');
        
        return true;
      } else {
        console.error('❌ Test upload failed:', response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ Test upload error:', error);
      return false;
    }
  }

  /**
   * Get setup status and instructions
   */
  public static getSetupStatus(): {
    initialized: boolean;
    signedIn: boolean;
    instructions: string[];
  } {
    const instructions: string[] = [];

    if (!this.isInitialized) {
      instructions.push('1. Initialize Google Drive API with valid credentials');
      instructions.push('2. Ensure API key and Client ID are configured');
    }

    if (this.isInitialized && !this.isSignedIn) {
      instructions.push('1. Sign in to Google Drive');
      instructions.push('2. Grant permissions for file access');
    }

    if (this.isInitialized && this.isSignedIn) {
      instructions.push('✅ Google Drive API ready to use');
    }

    return {
      initialized: this.isInitialized,
      signedIn: this.isSignedIn,
      instructions
    };
  }

  /**
   * Auto-setup with error handling
   */
  public static async autoSetup(config?: Partial<GoogleDriveConfig>): Promise<{
    success: boolean;
    message: string;
    folderId?: string;
  }> {
    try {
      // Step 1: Initialize
      const initSuccess = await this.initialize(config);
      if (!initSuccess) {
        return {
          success: false,
          message: 'Failed to initialize Google Drive API. Check credentials.'
        };
      }

      // Step 2: Sign in
      const signInSuccess = await this.signIn();
      if (!signInSuccess) {
        return {
          success: false,
          message: 'Failed to sign in to Google Drive. Check permissions.'
        };
      }

      // Step 3: Create folder
      const folderId = await this.createTaskImagesFolder();
      if (!folderId) {
        return {
          success: false,
          message: 'Failed to create TaskImages folder.'
        };
      }

      // Step 4: Test upload
      const testSuccess = await this.testUpload();
      if (!testSuccess) {
        return {
          success: false,
          message: 'Upload test failed. Check permissions.'
        };
      }

      return {
        success: true,
        message: 'Google Drive API setup completed successfully!',
        folderId
      };

    } catch (error) {
      return {
        success: false,
        message: `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Global types
declare global {
  const gapi: any;
}
