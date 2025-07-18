// Mock upload service for testing when local server is not available

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  type: string;
  uploadedAt: string;
  filename: string; // Server filename
}

export class MockUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static uploadedImages: UploadedImage[] = [];

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Loại file không được hỗ trợ. Chỉ chấp nhận: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File quá lớn. Kích thước tối đa: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (file.size === 0) {
      throw new Error('File rỗng không thể upload');
    }
  }

  /**
   * Create object URL for file preview
   */
  private static createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Simulate upload progress
   */
  private static simulateProgress(
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          onProgress?.({
            loaded: 100,
            total: 100,
            percentage: 100
          });
          resolve();
        } else {
          onProgress?.({
            loaded: progress,
            total: 100,
            percentage: Math.round(progress)
          });
        }
      }, 100);
    });
  }

  /**
   * Mock upload single image
   */
  public static async uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedImage> {
    try {
      // Validate file
      this.validateFile(file);

      console.log(`📤 [MOCK] Uploading image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Simulate upload progress
      await this.simulateProgress(onProgress);

      // Create mock uploaded image
      const uploadedImage: UploadedImage = {
        id: `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: this.createObjectURL(file),
        thumbnailUrl: this.createObjectURL(file),
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        filename: `mock_${Date.now()}_${file.name}`
      };

      // Store in memory
      this.uploadedImages.push(uploadedImage);

      return uploadedImage;

    } catch (error) {
      console.error('❌ [MOCK] Image upload failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mock upload multiple images
   */
  public static async uploadMultipleImages(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadedImage[]> {
    const results: UploadedImage[] = [];
    
    console.log(`📤 [MOCK] Uploading ${files.length} images...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadImage(file, (progress) => {
          onProgress?.(i, progress);
        });
        results.push(result);
        
      } catch (error) {
        console.error(`❌ [MOCK] Failed to upload ${file.name}:`, error);
        // Continue with other files instead of stopping
      }
    }

    console.log(`🎉 [MOCK] Upload completed: ${results.length}/${files.length} successful`);
    return results;
  }

  /**
   * Mock delete image
   */
  public static async deleteImage(filename: string): Promise<boolean> {
    try {
      const index = this.uploadedImages.findIndex(img => img.filename === filename);
      if (index !== -1) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(this.uploadedImages[index].url);
        URL.revokeObjectURL(this.uploadedImages[index].thumbnailUrl);
        
        this.uploadedImages.splice(index, 1);
        console.log(`🗑️ [MOCK] Deleted image: ${filename}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [MOCK] Failed to delete image:', error);
      return false;
    }
  }

  /**
   * Get all uploaded images
   */
  public static getAllImages(): UploadedImage[] {
    return [...this.uploadedImages];
  }

  /**
   * Clear all images
   */
  public static clearAllImages(): void {
    // Revoke all object URLs
    this.uploadedImages.forEach(img => {
      URL.revokeObjectURL(img.url);
      URL.revokeObjectURL(img.thumbnailUrl);
    });
    
    this.uploadedImages = [];
    console.log('🧹 [MOCK] Cleared all images');
  }

  /**
   * Check if mock service is available (always true)
   */
  public static async isServiceAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Get service info
   */
  public static getServiceInfo() {
    return {
      type: 'mock',
      name: 'Mock Upload Service',
      description: 'Simulates file upload for testing purposes',
      imagesCount: this.uploadedImages.length,
      maxFileSize: this.MAX_FILE_SIZE,
      allowedTypes: this.ALLOWED_TYPES
    };
  }
}

export default MockUploadService;
