/**
 * Image Upload Service - Upload ảnh lên Google Drive
 */

import { GoogleDriveSetup } from './GoogleDriveSetup';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  type: string;
  uploadedAt: string;
  driveFileId: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class ImageUploadService {
  private static readonly DRIVE_FOLDER_NAME = 'TaskImages';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  private static driveFolderId: string | null = null;

  /**
   * Upload ảnh lên Google Drive
   */
  public static async uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedImage> {
    try {
      // Validate file
      this.validateFile(file);

      // Ensure Google Drive API is loaded
      await this.ensureGoogleDriveAPI();

      // Get or create folder
      const folderId = await this.getOrCreateFolder();

      // Upload file
      const driveFile = await this.uploadToDrive(file, folderId, onProgress);

      // Create thumbnail
      const thumbnailUrl = await this.createThumbnail(file);

      // Return uploaded image info
      const uploadedImage: UploadedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: `https://drive.google.com/uc?id=${driveFile.id}`,
        thumbnailUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        driveFileId: driveFile.id
      };

      console.log('✅ Image uploaded successfully:', uploadedImage);
      return uploadedImage;

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple images
   */
  public static async uploadMultipleImages(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadedImage[]> {
    const results: UploadedImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadImage(file, (progress) => {
          onProgress?.(i, progress);
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Validate file
   */
  private static validateFile(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type not supported: ${file.type}. Allowed: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * Ensure Google Drive API is loaded
   */
  private static async ensureGoogleDriveAPI(): Promise<void> {
    // Check if GoogleDriveSetup is initialized
    if (!GoogleDriveSetup.isUserSignedIn()) {
      throw new Error('Google Drive not setup. Please configure Google Drive API first.');
    }
  }

  /**
   * Get or create folder in Google Drive
   */
  private static async getOrCreateFolder(): Promise<string> {
    if (this.driveFolderId) {
      return this.driveFolderId;
    }

    try {
      // Use GoogleDriveSetup to create folder
      const folderId = await GoogleDriveSetup.createTaskImagesFolder();
      if (!folderId) {
        throw new Error('Failed to create TaskImages folder');
      }

      this.driveFolderId = folderId;
      return this.driveFolderId;

    } catch (error) {
      console.error('Error managing Drive folder:', error);
      throw new Error('Failed to access Google Drive folder');
    }
  }

  /**
   * Upload file to Google Drive
   */
  private static async uploadToDrive(
    file: File,
    folderId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const metadata = {
        name: `${Date.now()}_${file.name}`,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            });
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name');
      xhr.setRequestHeader('Authorization', `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`);
      xhr.send(form);
    });
  }

  /**
   * Create thumbnail from file
   */
  private static async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail size (max 200x200)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete image from Google Drive
   */
  public static async deleteImage(driveFileId: string): Promise<void> {
    try {
      await this.ensureGoogleDriveAPI();
      await gapi.client.drive.files.delete({
        fileId: driveFileId
      });
      console.log('🗑️ Image deleted from Drive:', driveFileId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Get file info from Google Drive
   */
  public static async getImageInfo(driveFileId: string): Promise<any> {
    try {
      await this.ensureGoogleDriveAPI();
      const response = await gapi.client.drive.files.get({
        fileId: driveFileId,
        fields: 'id,name,size,mimeType,createdTime,webViewLink,webContentLink'
      });
      return response.result;
    } catch (error) {
      console.error('Error getting image info:', error);
      throw new Error('Failed to get image info');
    }
  }
}

// Global types for Google API
declare global {
  const gapi: any;
}
