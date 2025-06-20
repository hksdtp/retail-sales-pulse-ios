import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTasks, healthCheck, getUsers } from '@/services/api';
import { getApiUrl } from '@/config/api';

export const ApiTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    setApiUrl(getApiUrl());
  }, []);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await healthCheck();
      setResult({ type: 'health', data: response });
    } catch (error) {
      setResult({ type: 'health', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      setResult({ type: 'tasks', data: response });
    } catch (error) {
      setResult({ type: 'tasks', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setResult({ type: 'users', data: response });
    } catch (error) {
      setResult({ type: 'users', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setResult({ type: 'direct-fetch', data, status: response.status });
    } catch (error) {
      setResult({ type: 'direct-fetch', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 API Test Debug</CardTitle>
        <div className="text-sm text-gray-600">
          <strong>Current API URL:</strong> {apiUrl}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={testHealthCheck} disabled={loading} variant="outline">
            🏥 Health Check
          </Button>
          <Button onClick={testGetTasks} disabled={loading} variant="outline">
            📋 Get Tasks
          </Button>
          <Button onClick={testGetUsers} disabled={loading} variant="outline">
            👥 Get Users
          </Button>
          <Button onClick={testDirectFetch} disabled={loading} variant="outline">
            🔗 Direct Fetch
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Testing API...</span>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">
                {result.error ? '❌' : '✅'} Result ({result.type}):
              </h3>
              {result.status && (
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status >= 200 && result.status < 300
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Status: {result.status}
                </span>
              )}
            </div>
            <pre className={`p-4 rounded text-sm overflow-auto max-h-96 ${
              result.error ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
            }`}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
