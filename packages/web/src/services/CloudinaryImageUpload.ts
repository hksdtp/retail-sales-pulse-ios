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
  cloudinaryId?: string;
}

export class CloudinaryImageUpload {
  private static readonly CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  private static readonly CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  /**
   * Check if Cloudinary is configured and available
   */
  public static isCloudinaryAvailable(): boolean {
    return !!(this.CLOUDINARY_CLOUD_NAME && this.CLOUDINARY_UPLOAD_PRESET);
  }

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
  }

  /**
   * Upload single image to Cloudinary
   */
  public static async uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedImage> {
    try {
      // Validate file
      this.validateFile(file);

      console.log(`📤 [Cloudinary] Uploading image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'task-images'); // Organize uploads in folder

      // Upload to Cloudinary
      const response = await this.uploadToCloudinary(formData, onProgress);

      // Create uploaded image object
      const uploadedImage: UploadedImage = {
        id: `cloudinary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: response.secure_url,
        thumbnailUrl: response.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        cloudinaryId: response.public_id
      };

      console.log('✅ Image uploaded successfully to Cloudinary:', uploadedImage);
      return uploadedImage;

    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
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
   * Upload to Cloudinary with progress tracking
   */
  private static uploadToCloudinary(
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from Cloudinary'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      // Upload to Cloudinary
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  public static async deleteImage(cloudinaryId: string): Promise<boolean> {
    try {
      // Note: Deleting from Cloudinary requires server-side implementation
      // with API secret. This is a placeholder for future implementation.
      console.log(`🗑️ [Cloudinary] Delete image: ${cloudinaryId}`);
      
      // For now, just return true
      // In production, this should call your backend API to delete the image
      return true;
    } catch (error) {
      console.error('❌ Failed to delete image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  public static getOptimizedUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    if (!originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformation = '';
    if (width) transformation += `w_${width},`;
    if (height) transformation += `h_${height},`;
    if (quality) transformation += `q_${quality},`;
    if (format) transformation += `f_${format},`;
    
    // Remove trailing comma
    transformation = transformation.replace(/,$/, '');
    
    if (transformation) {
      return originalUrl.replace('/upload/', `/upload/${transformation}/`);
    }
    
    return originalUrl;
  }

  /**
   * Create thumbnail URL
   */
  public static getThumbnailUrl(originalUrl: string, size: number = 300): string {
    return this.getOptimizedUrl(originalUrl, {
      width: size,
      height: size,
      quality: 'auto',
      format: 'auto'
    });
  }
}

export default CloudinaryImageUpload;
