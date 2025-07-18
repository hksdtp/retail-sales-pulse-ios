import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CloudinaryImageUpload, { UploadedImage, UploadProgress } from '@/services/CloudinaryImageUpload';

interface ImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxImages?: number;
  existingImages?: UploadedImage[];
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: UploadProgress;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: UploadedImage;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  maxImages = 5,
  existingImages = [],
  disabled = false
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if Cloudinary is available
  const isCloudinaryAvailable = CloudinaryImageUpload.isCloudinaryAvailable();
  const isUploadDisabled = disabled || !isCloudinaryAvailable;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || isUploadDisabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - existingImages.length - uploadingFiles.filter(f => f.status === 'success').length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Initialize uploading files
    const newUploadingFiles: UploadingFile[] = filesToUpload.map(file => ({
      file,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    filesToUpload.forEach(async (file, index) => {
      try {
        const result = await CloudinaryImageUpload.uploadImage(file, (progress) => {
          setUploadingFiles(prev => prev.map((item, i) => {
            if (item.file === file) {
              return { ...item, progress };
            }
            return item;
          }));
        });

        // Update status to success
        setUploadingFiles(prev => prev.map(item => {
          if (item.file === file) {
            return { ...item, status: 'success', result };
          }
          return item;
        }));

        // Notify parent component
        const successfulUploads = uploadingFiles
          .filter(f => f.status === 'success')
          .map(f => f.result!)
          .concat([result]);
        
        onImagesUploaded(successfulUploads);

      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => prev.map(item => {
          if (item.file === file) {
            return { 
              ...item, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            };
          }
          return item;
        }));
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(item => item.file !== file));
  };

  const retryUpload = (file: File) => {
    setUploadingFiles(prev => prev.map(item => {
      if (item.file === file) {
        return { ...item, status: 'uploading', error: undefined, progress: { loaded: 0, total: file.size, percentage: 0 } };
      }
      return item;
    }));

    // Retry upload
    handleFileSelect(new DataTransfer().files);
  };

  const canUploadMore = existingImages.length + uploadingFiles.filter(f => f.status === 'success').length < maxImages;

  return (
    <div className="space-y-4">
      {/* Cloudinary Not Available Warning */}
      {!isCloudinaryAvailable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Đang phát triển
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Tính năng upload ảnh đang được phát triển.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && isCloudinaryAvailable && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${isUploadDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploadDisabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isUploadDisabled}
          />

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Upload ảnh
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Kéo thả hoặc click để chọn ảnh
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, GIF, WEBP • Tối đa 10MB • {maxImages - existingImages.length - uploadingFiles.filter(f => f.status === 'success').length} ảnh còn lại
            </p>
          </div>
        </div>
      )}

      {/* Uploading Files */}
      <AnimatePresence>
        {uploadingFiles.map((item, index) => (
          <motion.div
            key={`${item.file.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center space-x-3">
              {/* Thumbnail */}
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {item.status === 'success' && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {item.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Đang upload...</span>
                      <span>{item.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {item.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{item.error}</p>
                )}

                {/* Success Message */}
                {item.status === 'success' && (
                  <p className="text-xs text-green-500 mt-1">Upload thành công!</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {item.status === 'error' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryUpload(item.file)}
                    className="h-8 px-2 text-xs"
                  >
                    Thử lại
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeUploadingFile(item.file)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Existing Images Preview */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.thumbnailUrl || image.url}
                alt={image.name}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-red-400"
                  onClick={() => {
                    // Handle image removal
                    const updatedImages = existingImages.filter(img => img.id !== image.id);
                    onImagesUploaded(updatedImages);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
