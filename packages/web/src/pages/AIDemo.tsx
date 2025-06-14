import React from 'react';
import AIInsights from '@/components/dashboard/AIInsights';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';

const AIDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 Phân tích dữ liệu doanh số & Push Notifications Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm tính năng AI phân tích dữ liệu doanh số và hệ thống thông báo push thông minh
          </p>
        </div>

        {/* AI Insights & Push Notifications */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            <AIInsights />
          </div>
          
          <div>
            <PushNotificationManager />
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            ✨ Tính năng mới đã implement
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                🤖 Phân tích dữ liệu doanh số
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Phân tích xu hướng Hà Nội vs HCM</li>
                <li>• Cảnh báo nhân viên cần can thiệp</li>
                <li>• Dự báo doanh số tháng tới</li>
                <li>• Khuyến nghị hành động cụ thể</li>
                <li>• Top performers analysis</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                🔔 Push Notifications
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Thông báo công việc ưu tiên cao</li>
                <li>• Cảnh báo deadline 2 giờ trước</li>
                <li>• Thông báo công việc quá hạn</li>
                <li>• Tóm tắt hàng ngày</li>
                <li>• Cài đặt quy tắc thông báo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Trạng thái hoàn thành
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-green-600 font-semibold">Haptic Feedback</div>
              <div className="text-sm text-gray-600">100% hoàn thành</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-green-600 font-semibold">Badge Notifications</div>
              <div className="text-sm text-gray-600">100% hoàn thành</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-green-600 font-semibold">Swipe Gestures</div>
              <div className="text-sm text-gray-600">100% hoàn thành</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-green-600 font-semibold">AI + Push</div>
              <div className="text-sm text-gray-600">100% hoàn thành</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDemo;
