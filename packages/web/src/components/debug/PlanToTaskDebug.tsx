import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bug, 
  Play, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { planToTaskSyncService } from '@/services/PlanToTaskSyncService';
import { personalPlanService } from '@/services/PersonalPlanService';
import { testPlanToTaskSync } from '@/utils/testPlanToTaskSync';

const PlanToTaskDebug: React.FC = () => {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Chỉ hiển thị trong development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // Cập nhật stats
  const updateStats = () => {
    setStats(planToTaskSyncService.getStats());
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRunTest = async () => {
    if (!currentUser?.id) return;
    
    setIsRunningTest(true);
    try {
      const result = await testPlanToTaskSync.runFullTest(currentUser.id);
      setTestResult(result);
      updateStats();
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, error });
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleCleanup = () => {
    if (!currentUser?.id) return;
    testPlanToTaskSync.cleanup(currentUser.id);
    setTestResult(null);
    updateStats();
  };

  const handleManualSync = async () => {
    if (!currentUser?.id) return;
    try {
      await planToTaskSyncService.manualSync(currentUser.id);
      updateStats();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  if (!isVisible || !currentUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-40 w-80"
    >
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bug className="w-4 h-4 text-yellow-400" />
            Plan→Task Debug
            <Badge variant="outline" className="bg-yellow-900 text-yellow-200 border-yellow-600">
              DEV
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Checked</div>
                <div className="font-bold">{stats.totalPlansChecked}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Converted</div>
                <div className="font-bold text-green-400">{stats.plansConverted}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Failed</div>
                <div className="font-bold text-red-400">{stats.plansFailed}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Active</div>
                <div className="font-bold text-blue-400">
                  {planToTaskSyncService.isActive() ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          {/* User Plans Info */}
          <div className="bg-gray-800 p-2 rounded text-xs">
            <div className="text-gray-400 mb-1">User Plans</div>
            <div className="flex gap-2">
              <span>Total: {personalPlanService.getUserPlans(currentUser.id).length}</span>
              <span>Due: {personalPlanService.getDuePlans(currentUser.id).length}</span>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-2 rounded text-xs ${
              testResult.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {testResult.success ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                Test Result
              </div>
              {testResult.success ? (
                <div>
                  <div>Plans: {testResult.plansAfterSync}</div>
                  <div>Completed: {testResult.completedPlans}</div>
                  <div>Converted: {testResult.syncResult?.plansConverted || 0}</div>
                </div>
              ) : (
                <div>Error: {testResult.error}</div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
            >
              {isRunningTest ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              className="h-7 text-xs border-gray-600 hover:bg-gray-800"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanup}
              className="h-7 text-xs border-gray-600 hover:bg-gray-800"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Console Commands */}
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div>Console commands:</div>
            <div className="font-mono text-xs">
              <div>testPlanToTaskSync.runFullTest('{currentUser.id}')</div>
              <div>testPlanToTaskSync.cleanup('{currentUser.id}')</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlanToTaskDebug;
