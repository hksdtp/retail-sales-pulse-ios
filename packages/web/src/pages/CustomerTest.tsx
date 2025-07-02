import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const CustomerTest: React.FC = () => {
  const { currentUser, isLoading, users } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🧪 Starting customer component tests...');

      // Test 1: Check Auth Context
      addResult(`✅ Auth Context loaded: ${currentUser ? 'Yes' : 'No'}`);
      if (currentUser) {
        addResult(`✅ Current user: ${currentUser.name} (${currentUser.role})`);
      }

      // Test 2: Check Users Array
      addResult(`✅ Users loaded: ${users.length} users`);

      // Test 3: Test Customer Types Import
      try {
        const { CUSTOMER_TYPES } = await import('@/types/customer');
        addResult(`✅ Customer types imported: ${CUSTOMER_TYPES.length} types`);
      } catch (error) {
        addResult(`❌ Failed to import customer types: ${error}`);
      }

      // Test 4: Test Customer Service Import
      try {
        const { customerService } = await import('@/services/CustomerService');
        addResult(`✅ Customer service imported successfully`);
        
        if (currentUser) {
          const permissions = customerService.getCustomerPermissions(currentUser);
          addResult(`✅ Permissions calculated: canViewAll=${permissions.canViewAll}, canCreate=${permissions.canCreate}`);
        }
      } catch (error) {
        addResult(`❌ Failed to import customer service: ${error}`);
      }

      // Test 5: Test UI Components Import
      try {
        const { Button } = await import('@/components/ui/button');
        addResult(`✅ UI Button component imported successfully`);
      } catch (error) {
        addResult(`❌ Failed to import UI Button: ${error}`);
      }

      try {
        const { Card } = await import('@/components/ui/card');
        addResult(`✅ UI Card component imported successfully`);
      } catch (error) {
        addResult(`❌ Failed to import UI Card: ${error}`);
      }

      // Test 6: Test Customer Components Import
      try {
        const { CustomerList } = await import('@/components/customers/CustomerList');
        addResult(`✅ CustomerList component imported successfully`);
      } catch (error) {
        addResult(`❌ Failed to import CustomerList: ${error}`);
      }

      try {
        const { CustomerForm } = await import('@/components/customers/CustomerForm');
        addResult(`✅ CustomerForm component imported successfully`);
      } catch (error) {
        addResult(`❌ Failed to import CustomerForm: ${error}`);
      }

      // Test 7: Test Supabase Service
      try {
        const { SupabaseService } = await import('@/services/SupabaseService');
        const supabaseService = SupabaseService.getInstance();
        addResult(`✅ Supabase service imported successfully`);
        addResult(`✅ Supabase configured: ${supabaseService.isInitialized() ? 'Yes' : 'No'}`);
      } catch (error) {
        addResult(`❌ Failed to import Supabase service: ${error}`);
      }

      addResult('🎉 All tests completed!');
    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto run tests when component mounts
    if (!isLoading) {
      runTests();
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Customer Component Test Suite
        </h1>
        
        <div className="space-y-6">
          {/* Test Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Test Controls</h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-4 py-2 rounded text-white ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Auth Status:</strong> {isLoading ? 'Loading...' : (currentUser ? 'Authenticated' : 'Not authenticated')}
              </div>
              <div>
                <strong>Users Count:</strong> {users.length}
              </div>
              <div>
                <strong>Environment:</strong> {window.location.hostname}
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No test results yet...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a 
                href="/customers" 
                className="block text-blue-600 hover:underline"
              >
                → Try Full Customers Page
              </a>
              <a 
                href="/simple-customers" 
                className="block text-blue-600 hover:underline"
              >
                → Try Simple Customers Page
              </a>
              <a 
                href="/debug" 
                className="block text-blue-600 hover:underline"
              >
                → Debug Page
              </a>
              <button
                onClick={() => {
                  console.clear();
                  console.log('🧪 Customer Test Page - Console cleared');
                }}
                className="text-purple-600 hover:underline"
              >
                → Clear Console
              </button>
            </div>
          </div>

          {/* Error Boundary Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Error Boundary Test</h2>
            <p className="text-gray-600 mb-4">
              Test if error boundaries are working properly:
            </p>
            <button
              onClick={() => {
                throw new Error('Test error for error boundary');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Trigger Test Error
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTest;
