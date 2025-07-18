import React from 'react';

const SimpleCustomers: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧑‍💼 Khách hàng - Simple Version
        </h1>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              ✅ Trang khách hàng đã load thành công!
            </h2>
            <p className="text-blue-700">
              Đây là phiên bản đơn giản để test xem có vấn đề gì với components phức tạp không.
            </p>
          </div>

          {/* Test Authentication */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🔐 Test Authentication
            </h3>
            <div className="space-y-2 text-green-700">
              <p>• URL hiện tại: {window.location.href}</p>
              <p>• Hostname: {window.location.hostname}</p>
              <p>• Test environment: {window.location.hostname === 'localhost' ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Test Components */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🧪 Test Basic Components
            </h3>
            <div className="space-y-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Test Button
              </button>
              
              <input 
                type="text" 
                placeholder="Test input"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 border rounded shadow">
                  <h4 className="font-semibold">Card 1</h4>
                  <p>Test card content</p>
                </div>
                <div className="bg-white p-4 border rounded shadow">
                  <h4 className="font-semibold">Card 2</h4>
                  <p>Test card content</p>
                </div>
                <div className="bg-white p-4 border rounded shadow">
                  <h4 className="font-semibold">Card 3</h4>
                  <p>Test card content</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Test */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              🧭 Navigation Test
            </h3>
            <div className="space-y-2">
              <a href="/" className="block text-purple-600 hover:underline">
                → Về trang chủ
              </a>
              <a href="/debug" className="block text-purple-600 hover:underline">
                → Debug page
              </a>
              <a href="/customers" className="block text-purple-600 hover:underline">
                → Customers (full version)
              </a>
              <a href="/tasks" className="block text-purple-600 hover:underline">
                → Tasks
              </a>
            </div>
          </div>

          {/* Local Storage Test */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💾 Local Storage Test
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>currentUser:</strong> {localStorage.getItem('currentUser') ? 'Found' : 'Not found'}</p>
              <p><strong>authToken:</strong> {localStorage.getItem('authToken') ? 'Found' : 'Not found'}</p>
              <p><strong>isAuthenticated:</strong> {localStorage.getItem('isAuthenticated') || 'Not set'}</p>
            </div>
          </div>

          {/* Console Test */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">
              🔍 Console Test
            </h3>
            <p className="text-red-700 mb-3">
              Mở Developer Tools (F12) và kiểm tra Console tab để xem có lỗi nào không.
            </p>
            <button 
              onClick={() => {
                
                console.log('Current URL:', window.location.href);
                console.log('Local storage:', {
                  currentUser: localStorage.getItem('currentUser'),
                  authToken: localStorage.getItem('authToken'),
                  isAuthenticated: localStorage.getItem('isAuthenticated')
                });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Log to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCustomers;
