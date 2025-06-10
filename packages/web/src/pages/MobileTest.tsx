import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

export default function MobileTest() {
  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Mobile Test Page</h1>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Test Content</h2>
          <p className="text-gray-600 mb-4">
            This is a test page to check if mobile layout is working correctly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium">Card 1</h3>
              <p className="text-sm text-gray-600">Some content here</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium">Card 2</h3>
              <p className="text-sm text-gray-600">Some content here</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
