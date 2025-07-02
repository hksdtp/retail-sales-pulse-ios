import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContextSupabase';
import { ApiTest } from '@/components/debug/ApiTest';
import { LoginTest } from '@/components/debug/LoginTest';
import SupabaseTestPanel from '@/components/debug/SupabaseTestPanel';

const DebugPage: React.FC = () => {
  const { currentUser, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'auth' | 'api' | 'login' | 'supabase'>('supabase');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug & Test Center</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'supabase', label: '🚀 Supabase Test', desc: 'Test Supabase migration' },
            { id: 'login', label: '🔐 Login Test', desc: 'Test authentication & password' },
            { id: 'api', label: '🌐 API Test', desc: 'Test API endpoints' },
            { id: 'auth', label: '👤 Auth Status', desc: 'Current auth state' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Supabase Test Tab */}
          {activeTab === 'supabase' && <SupabaseTestPanel />}

          {/* Login Test Tab */}
          {activeTab === 'login' && <LoginTest />}

          {/* API Test Tab */}
          {activeTab === 'api' && <ApiTest />}

          {/* Auth Status Tab */}
          {activeTab === 'auth' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
                <div className="space-y-2">
                  <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                  <p><strong>Current User:</strong> {currentUser ? currentUser.name : 'Not logged in'}</p>
                  {currentUser && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <pre>{JSON.stringify(currentUser, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>

          {/* Navigation Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <div className="space-y-2">
              <a href="/" className="block text-blue-600 hover:underline">→ Home</a>
              <a href="/login" className="block text-blue-600 hover:underline">→ Login</a>
              <a href="/customers" className="block text-blue-600 hover:underline">→ Customers</a>
              <a href="/tasks" className="block text-blue-600 hover:underline">→ Tasks</a>
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
            <div className="space-y-2">
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Local Storage:</strong></p>
              <div className="mt-2 p-4 bg-gray-50 rounded text-sm">
                {Object.keys(localStorage).map(key => (
                  <div key={key}>
                    <strong>{key}:</strong> {localStorage.getItem(key)}
                  </div>
                ))}
              </div>
            </div>
          </div>

              {/* Console Errors */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Console Check</h2>
                <p>Check browser console for any JavaScript errors.</p>
                <button
                  onClick={() => console.log('Debug button clicked')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Console Log
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
