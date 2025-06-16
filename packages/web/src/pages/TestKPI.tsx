import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testKpiCalculation, testTaskTypeDisplay } from '@/utils/test-kpi';

const TestKPI: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runKpiTest = () => {
    console.clear();
    console.log('🧪 Running KPI Tests...');
    
    // Capture console logs
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };

    try {
      testKpiCalculation();
      testTaskTypeDisplay();
      setTestResults(logs);
    } finally {
      console.log = originalLog;
    }
  };

  const runTaskTypeTest = () => {
    console.clear();
    console.log('🎨 Running Task Type Display Tests...');
    
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };

    try {
      testTaskTypeDisplay();
      setTestResults(logs);
    } finally {
      console.log = originalLog;
    }
  };

  useEffect(() => {
    // Auto run tests on mount
    runKpiTest();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KPI Test Dashboard</h1>
        <p className="text-gray-600">Test KPI calculation and task type display</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 KPI Calculation Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Test tính toán KPI cho tất cả loại công việc
              </p>
              <Button onClick={runKpiTest} className="w-full">
                Run KPI Test
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎨 Task Type Display Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Test hiển thị tên loại công việc
              </p>
              <Button onClick={runTaskTypeTest} className="w-full">
                Run Display Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expected KPI Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">KTS</h3>
              <p className="text-sm text-blue-700">Total: 3, Completed: 2, Rate: 67%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">Đối tác</h3>
              <p className="text-sm text-orange-700">Total: 2, Completed: 1, Rate: 50%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Khách hàng</h3>
              <p className="text-sm text-green-700">Total: 3, Completed: 1, Rate: 33%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Báo giá</h3>
              <p className="text-sm text-purple-700">Total: 2, Completed: 1, Rate: 50%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">Công việc khác</h3>
              <p className="text-sm text-gray-700">Total: 2, Completed: 1, Rate: 50%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Type Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Internal Types</h4>
              <ul className="text-sm space-y-1 font-mono">
                <li>partner_new</li>
                <li>partner_old</li>
                <li>architect_new</li>
                <li>architect_old</li>
                <li>client_new</li>
                <li>client_old</li>
                <li>quote_new</li>
                <li>quote_old</li>
                <li>other</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Display Names</h4>
              <ul className="text-sm space-y-1">
                <li>Đối tác mới</li>
                <li>Đối tác cũ</li>
                <li>KTS mới</li>
                <li>KTS cũ</li>
                <li>Khách hàng mới</li>
                <li>Khách hàng cũ</li>
                <li>Báo giá mới</li>
                <li>Báo giá cũ</li>
                <li>Công việc khác</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestKPI;
