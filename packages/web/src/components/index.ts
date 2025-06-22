// Barrel exports for components
// This file provides a centralized way to import components

// Core components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as ChangePasswordForm } from './ChangePasswordForm';

// Layout components
export { default as AppLayout } from './layout/AppLayout';
export { default as BottomNavigation } from './layout/BottomNavigation';
export { default as PageHeader } from './layout/PageHeader';
export { default as Sidebar } from './layout/Sidebar';
export { default as VersionChecker } from './layout/VersionChecker';

// Auth/Login components
export { default as LoginForm } from './login/LoginForm';
export { default as LoginLoadingScreen } from './login/LoginLoadingScreen';
export { default as GoogleLoginButton } from './login/GoogleLoginButton';
export { default as PasswordField } from './login/PasswordField';
export { default as PasswordInput } from './login/PasswordInput';
export { default as ChangePasswordModal } from './login/ChangePasswordModal';
export { default as DirectorView } from './login/DirectorView';
export { default as RegularUserView } from './login/RegularUserView';
export { default as LocationSelector } from './login/LocationSelector';
export { default as TeamSelector } from './login/TeamSelector';
export { default as UserSelector } from './login/UserSelector';
export { default as StepIndicator } from './login/StepIndicator';
export { default as SubmitButton } from './login/SubmitButton';

// Task components
export { default as TaskList } from './tasks/TaskList';
export { default as TaskDetailPanel } from './tasks/TaskDetailPanel';
export { default as TaskFilter } from './tasks/TaskFilter';
export { default as TaskSearchBar } from './tasks/TaskSearchBar';
export { default as TaskCalendar } from './tasks/TaskCalendar';
export { default as TaskKanban } from './tasks/TaskKanban';
export { default as TaskTabs } from './tasks/TaskTabs';
export { default as TaskViewSelector } from './tasks/TaskViewSelector';
export { default as TaskFormDialog } from './tasks/TaskFormDialog';
export { default as TaskFormDemo } from './tasks/TaskFormDemo';
export { default as TaskManagementView } from './tasks/TaskManagementView';
export { default as SimpleTaskView } from './tasks/SimpleTaskView';
export { default as LocalTaskList } from './tasks/LocalTaskList';
export { default as MemberTaskSelector } from './tasks/MemberTaskSelector';
export { default as MemberViewFilters } from './tasks/MemberViewFilters';

// Dashboard components
export { default as KpiDashboard } from './dashboard/KpiDashboard';
export { default as SimpleDashboard } from './dashboard/SimpleDashboard';
export { default as KpiCard } from './dashboard/KpiCard';
export { default as RevenueChart } from './dashboard/RevenueChart';
export { default as ConversionRates } from './dashboard/ConversionRates';
export { default as RegionDistribution } from './dashboard/RegionDistribution';
export { default as TopPerformers } from './dashboard/TopPerformers';
export { default as AIInsights } from './dashboard/AIInsights';

// Planning components
export { default as PlanningDashboard } from './planning/PlanningDashboard';
export { default as PlanList } from './planning/PlanList';
export { default as CreatePlanModal } from './planning/CreatePlanModal';
export { default as EditPlanModal } from './planning/EditPlanModal';
export { default as SimpleCreatePlanModal } from './planning/SimpleCreatePlanModal';
export { default as PlanSearchBar } from './planning/PlanSearchBar';
export { default as PlanSyncStatus } from './planning/PlanSyncStatus';

// Calendar components
export { default as ModernCalendar } from './calendar/ModernCalendar';
export { default as MonthlyPlanList } from './calendar/MonthlyPlanList';
export { default as SimpleCalendarGrid } from './calendar/SimpleCalendarGrid';

// Customer components
export { default as CustomerList } from './customers/CustomerList';
export { default as CustomerCard } from './customers/CustomerCard';
export { default as CustomerForm } from './customers/CustomerForm';
export { default as CustomerSelector } from './customers/CustomerSelector';

// Employee components
export { default as EmployeeListView } from './employees/EmployeeListView';
export { default as EmployeeCard } from './employees/EmployeeCard';
export { default as EmployeeDetailModal } from './employees/EmployeeDetailModal';
export { default as EmployeeSearchFilters } from './employees/EmployeeSearchFilters';
export { default as EmployeeStatsCards } from './employees/EmployeeStatsCards';

// Settings components
export { default as AccountSettings } from './account/AccountSettings';
export { default as FirebaseConfig } from './settings/FirebaseConfig';
export { default as GoogleSheetsConfig } from './settings/GoogleSheetsConfig';

// Firebase components
export { default as AutoFirebaseSetup } from './firebase/AutoFirebaseSetup';
export { default as FirebaseAutoSetupProvider } from './firebase/FirebaseAutoSetupProvider';

// Notification components
export { default as NotificationCenter } from './notifications/NotificationCenter';
export { default as NotificationTestButton } from './notifications/NotificationTestButton';
export { default as PlanToTaskNotification } from './notifications/PlanToTaskNotification';
export { default as PushNotificationManager } from './notifications/PushNotificationManager';

// Report components
export { default as SalesReports } from './reports/SalesReports';
export { default as DetailedOverviewComponent } from './reports/DetailedOverviewComponent';
export { default as TimeAnalysisComponent } from './reports/TimeAnalysisComponent';

// KPI components
export { default as KpiOverview } from './kpi/KpiOverview';
export { default as KpiProgressCard } from './kpi/KpiProgressCard';
export { default as TaskKpiOverview } from './kpi/TaskKpiOverview';

// Organization components
export { default as OrganizationChart } from './organization/OrganizationChart';

// Team components
export { default as TeamLeadersList } from './teams/TeamLeadersList';

// Export components
export { default as ExportDialog } from './export/ExportDialog';

// Sync components
export { default as LocalStorageSyncPanel } from './sync/LocalStorageSyncPanel';

// Debug components
export { default as ApiTest } from './debug/ApiTest';
export { default as LoginTest } from './debug/LoginTest';

// Mobile components
export { default as MobileOptimizations } from './mobile/MobileOptimizations';

// AI components
export { default as EnhancePromptDemo } from './ai/EnhancePromptDemo';

// Augment components
export { default as AugmentMCPDemo } from './augment/AugmentMCPDemo';

// Curtain components
export { default as LuxuryCurtainApp } from './curtain/LuxuryCurtainApp';
