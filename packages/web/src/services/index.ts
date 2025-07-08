// Services barrel exports
// Centralized exports for all services

// Core services
export { SupabaseService } from './SupabaseService';
export { default as CustomerService } from './CustomerService';
export { default as SyncService } from './SyncService';
export { default as DashboardSyncService } from './DashboardSyncService';

// Google Sheets services
export { default as GoogleSheetsService } from './GoogleSheetsService';
export { default as AppsScriptGoogleSheetsService } from './AppsScriptGoogleSheetsService';
export { default as CustomerGoogleSheetsService } from './CustomerGoogleSheetsService';

// Plan services
export { default as PersonalPlanService } from './PersonalPlanService';
export { default as AutoPlanSyncService } from './AutoPlanSyncService';
export { default as PlanTaskSyncService } from './PlanTaskSyncService';
export { default as PlanToTaskSyncService } from './PlanToTaskSyncService';

// Task services
export { default as TaskKpiService } from './TaskKpiService';
export { default as TaskSuggestionService } from './TaskSuggestionService';

// Upload services
export { default as ImageUploadService } from './ImageUploadService';
export { default as MockUploadService } from './MockUploadService';

// Report services
export { default as ReportsDataService } from './ReportsDataService';

// AI services
export { default as aiInsightsService } from './aiInsightsService';
export { default as augmentMcpClient } from './augment-mcp-client';

// Notification services
export { default as notificationService } from './notificationService';
export { default as pushNotificationService } from './pushNotificationService';

// Auth services
export { default as mockAuth } from './mockAuth';
export { default as passwordService } from './passwordService';

// API service
export * from './api';
