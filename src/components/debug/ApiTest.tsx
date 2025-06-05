import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTasks, healthCheck } from '@/services/api';

export const ApiTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Test Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testHealthCheck} disabled={loading}>
            Test Health Check
          </Button>
          <Button onClick={testGetTasks} disabled={loading}>
            Test Get Tasks
          </Button>
        </div>
        
        {loading && <div>Loading...</div>}
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold">Result ({result.type}):</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
