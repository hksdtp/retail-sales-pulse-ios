import { useContext } from 'react';

import { useAuth } from '../context/AuthContextSupabase';
import { SupabaseTaskDataContext } from '../context/SupabaseTaskDataProvider';

export const useTaskData = () => {
  const context = useContext(SupabaseTaskDataContext);
  const { currentUser } = useAuth();

  // Debug logs enabled for debugging deletion issue
  console.log('🔍 [USE_TASK_DATA_DEBUG] ===== SUPABASE HOOK DEBUG =====');
  console.log('🔍 [USE_TASK_DATA_DEBUG] context:', context);
  console.log('🔍 [USE_TASK_DATA_DEBUG] context exists:', !!context);
  console.log('🔍 [USE_TASK_DATA_DEBUG] context.deleteTask:', context?.deleteTask);
  console.log('🔍 [USE_TASK_DATA_DEBUG] context keys:', context ? Object.keys(context) : []);
  console.log('🔍 [USE_TASK_DATA_DEBUG] currentUser:', currentUser);
  console.log('🔍 [USE_TASK_DATA_DEBUG] ===============================');

  if (!context) {
    console.error('❌ SupabaseTaskDataContext not found!');
    throw new Error('useTaskData must be used within a SupabaseTaskDataProvider');
  }

  return {
    ...context,
    currentUser,
  };
};
