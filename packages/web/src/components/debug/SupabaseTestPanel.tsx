import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database, Users, Building, ClipboardList } from 'lucide-react';
import { SupabaseService } from '@/services/SupabaseService';
import { testSupabaseMigration, testSupabaseOperations } from '@/utils/testSupabaseMigration';

const SupabaseTestPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const runMigrationTest = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      const results = await testSupabaseMigration();
      setTestResults(results);
      setConnectionStatus(results.success ? 'success' : 'error');
    } catch (error) {
      console.error('Test failed:', error);
      setConnectionStatus('error');
      setTestResults({
        success: false,
        tests: {},
        errors: [error.message],
        details: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runOperationsTest = async () => {
    setIsLoading(true);
    try {
      await testSupabaseOperations();
    } catch (error) {
      console.error('Operations test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testUsersLoad = async () => {
    setIsLoading(true);
    try {
      const supabaseService = SupabaseService.getInstance();
      console.log('🧪 Testing users load from Supabase...');

      const users = await supabaseService.getUsers();
      const teams = await supabaseService.getTeams();

      console.log('📊 Users loaded:', users.length);
      console.log('📊 Teams loaded:', teams.length);
      console.log('👥 Users data:', users);
      console.log('🏢 Teams data:', teams);

      setTestResults({
        success: users.length > 0 && teams.length > 0,
        tests: {
          connection: true,
          authentication: true,
          users: users.length > 0,
          teams: teams.length > 0,
          tasks: true
        },
        errors: users.length === 0 ? ['No users found'] : teams.length === 0 ? ['No teams found'] : [],
        details: {
          users: { count: users.length, sample: users.slice(0, 3) },
          teams: { count: teams.length, sample: teams.slice(0, 3) }
        }
      });
    } catch (error) {
      console.error('❌ Users load test failed:', error);
      setTestResults({
        success: false,
        tests: { connection: false, authentication: false, users: false, teams: false, tasks: false },
        errors: [error.message],
        details: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSupabaseConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return {
      hasUrl: !!url && url !== 'https://your-project-id.supabase.co',
      hasKey: !!key && key !== 'your-anon-key-here',
      url: url || 'Not configured',
      keyPreview: key ? `${key.substring(0, 20)}...` : 'Not configured'
    };
  };

  const config = checkSupabaseConfig();
  const isConfigured = config.hasUrl && config.hasKey;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Migration Test Panel
          </CardTitle>
          <CardDescription>
            Test kết nối và functionality sau khi migration từ Firebase sang Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          <div className="space-y-2">
            <h3 className="font-medium">Configuration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Supabase URL</span>
                <Badge variant={config.hasUrl ? "default" : "destructive"}>
                  {config.hasUrl ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Anon Key</span>
                <Badge variant={config.hasKey ? "default" : "destructive"}>
                  {config.hasKey ? "Configured" : "Missing"}
                </Badge>
              </div>
            </div>
            
            {!isConfigured && (
              <Alert>
                <AlertDescription>
                  Vui lòng cập nhật file .env với thông tin Supabase thực tế:
                  <br />
                  VITE_SUPABASE_URL=https://your-project.supabase.co
                  <br />
                  VITE_SUPABASE_ANON_KEY=your-anon-key
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={runMigrationTest}
              disabled={isLoading || !isConfigured}
              className="flex items-center gap-2"
            >
              {getStatusIcon(connectionStatus)}
              Test Migration
            </Button>
            <Button
              onClick={runOperationsTest}
              disabled={isLoading || !isConfigured}
              variant="outline"
            >
              Test CRUD Operations
            </Button>
            <Button
              onClick={testUsersLoad}
              disabled={isLoading || !isConfigured}
              variant="secondary"
            >
              Test Users Load
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Test Results</h3>
                <Badge variant={testResults.success ? "default" : "destructive"}>
                  {testResults.success ? "All Passed" : "Some Failed"}
                </Badge>
              </div>

              {/* Individual Test Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Connection</span>
                  </div>
                  {getTestIcon(testResults.tests.connection)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Users Table</span>
                  </div>
                  {getTestIcon(testResults.tests.users)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Teams Table</span>
                  </div>
                  {getTestIcon(testResults.tests.teams)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Tasks Table</span>
                  </div>
                  {getTestIcon(testResults.tests.tasks)}
                </div>
              </div>

              {/* Details */}
              {testResults.details && (
                <div className="space-y-2">
                  <h4 className="font-medium">Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <pre>{JSON.stringify(testResults.details, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Errors */}
              {testResults.errors && testResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors</h4>
                  {testResults.errors.map((error: string, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseTestPanel;
