import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { login, changePassword } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export const LoginTest: React.FC = () => {
  const [email, setEmail] = useState('manh.khong@example.com');
  const [password, setPassword] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { currentUser, logout } = useAuth();

  const testCases = [
    {
      name: '🆕 First Login (Default Password)',
      email: 'user1@example.com',
      password: '123456',
      description: 'Test first login with default password'
    },
    {
      name: '🔑 Admin Master Password',
      email: 'user1@example.com',
      password: 'haininh1',
      description: 'Test admin master password access'
    },
    {
      name: '❌ Wrong Password',
      email: 'user1@example.com',
      password: 'wrongpass',
      description: 'Test wrong password rejection'
    },
    {
      name: '✅ Real User - Việt Anh',
      email: 'vietanh@example.com',
      password: '123456',
      description: 'Test real user first login'
    },
    {
      name: '🔑 Admin Master - Việt Anh',
      email: 'vietanh@example.com',
      password: 'haininh1',
      description: 'Test admin access to real user'
    }
  ];

  const testLogin = async (testEmail?: string, testPassword?: string) => {
    setLoading(true);
    try {
      const loginEmail = testEmail || email;
      const loginPassword = testPassword || password;
      
      console.log(`🔐 Testing login: ${loginEmail} / ${loginPassword}`);
      const response = await login(loginEmail, loginPassword);
      
      setResult({
        type: 'login',
        email: loginEmail,
        password: loginPassword,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResult({
        type: 'login',
        email: testEmail || email,
        password: testPassword || password,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testChangePassword = async (testUserId?: string, testNewPassword?: string) => {
    const userId = testUserId || currentUser?.id;
    const passwordToUse = testNewPassword || newPassword;

    if (!userId || !passwordToUse) {
      setResult({
        type: 'change-password',
        error: 'Need userId and new password',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`🔄 Testing password change for: ${userId}`);
      const response = await changePassword(userId, passwordToUse);

      setResult({
        type: 'change-password',
        userId,
        newPassword: passwordToUse,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResult({
        type: 'change-password',
        userId,
        newPassword: passwordToUse,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick test functions
  const quickTests = {
    changePasswordUser1: () => testChangePassword('user1', 'newpass123'),
    changePasswordUser2: () => testChangePassword('user2', 'newpass456'),
    changePasswordVietAnh: () => testChangePassword('Ue4vzSj1KDg4vZyXwlHJ', 'vietanh123'),
  };

  const runTestCase = (testCase: any) => {
    setEmail(testCase.email);
    setPassword(testCase.password);
    testLogin(testCase.email, testCase.password);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>🔐 Login & Password Test</CardTitle>
        {currentUser && (
          <div className="text-sm bg-green-50 p-2 rounded">
            <strong>Logged in as:</strong> {currentUser.name} ({currentUser.email})
            <br />
            <strong>User ID:</strong> {currentUser.id} | <strong>Role:</strong> {currentUser.role}
            <Button onClick={logout} size="sm" variant="outline" className="ml-2">
              Logout
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Quick Test Cases */}
        <div>
          <h3 className="font-semibold mb-3">🚀 Quick Test Cases</h3>
          <div className="grid grid-cols-2 gap-2">
            {testCases.map((testCase, index) => (
              <Button
                key={index}
                onClick={() => runTestCase(testCase)}
                disabled={loading}
                variant="outline"
                className="text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium">{testCase.name}</div>
                  <div className="text-xs text-gray-500">{testCase.description}</div>
                  <div className="text-xs text-blue-600">{testCase.email} / {testCase.password}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Manual Login Test */}
        <div>
          <h3 className="font-semibold mb-3">🔧 Manual Login Test</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => testLogin()} disabled={loading} className="w-full">
                🔐 Test Login
              </Button>
            </div>
          </div>
        </div>

        {/* Change Password Test */}
        <div>
          <h3 className="font-semibold mb-3">🔄 Change Password Test</h3>

          {/* Quick Password Change Tests */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Quick Tests:</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={quickTests.changePasswordUser1}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                🔄 Change user1 → newpass123
              </Button>
              <Button
                onClick={quickTests.changePasswordUser2}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                🔄 Change user2 → newpass456
              </Button>
              <Button
                onClick={quickTests.changePasswordVietAnh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                🔄 Change VietAnh → vietanh123
              </Button>
            </div>
          </div>

          {/* Manual Password Change */}
          {currentUser ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Current User ID: {currentUser.id}
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={() => testChangePassword()} disabled={loading || !newPassword} className="w-full">
                  🔄 Change Password
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ You can use Quick Tests above, or login first for manual testing.
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Testing...</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">
                {result.error ? '❌' : '✅'} Result ({result.type}):
              </h3>
              <span className="text-xs text-gray-500">{result.timestamp}</span>
            </div>
            <pre className={`p-4 rounded text-sm overflow-auto max-h-96 ${
              result.error ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
            }`}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Password Rules */}
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">🔒 Password Rules</h4>
          <ul className="text-sm space-y-1">
            <li><strong>Admin Master:</strong> <code>haininh1</code> - Can login to any account</li>
            <li><strong>First Login:</strong> <code>123456</code> - Default password, must change</li>
            <li><strong>After Change:</strong> Use custom password set by user</li>
            <li><strong>Wrong Password:</strong> Will be rejected with error message</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
