// Context barrel exports
// Centralized exports for all React contexts

// Auth context
export { AuthProvider, useAuth } from './AuthContextSupabase';

// Task contexts
export { TaskContext, TaskProvider, useTaskContext } from './TaskContext';
export { default as TaskDataProvider } from './TaskDataProvider';
export { default as ApiTaskDataProvider } from './ApiTaskDataProvider';
export { default as FirebaseTaskDataProvider } from './FirebaseTaskDataProvider';

// Theme context
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
