import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoogleDriveSetupComponent from '@/components/admin/GoogleDriveSetup';

const GoogleDriveSetupPage: React.FC = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Google Drive API Setup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Cấu hình Google Drive API để cho phép upload ảnh vào công việc. 
              Làm theo hướng dẫn bên dưới để hoàn tất setup.
            </p>
          </div>
        </div>

        {/* Setup Component */}
        <div className="max-w-4xl mx-auto">
          <GoogleDriveSetupComponent />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Cần hỗ trợ? Liên hệ admin hoặc xem{' '}
            <a 
              href="https://developers.google.com/drive/api/quickstart/js" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              tài liệu Google Drive API
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveSetupPage;
