import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import ProtectedRoute from './components/ProtectedRoute';
import VersionChecker from './components/layout/VersionChecker';

import { Toaster as Sonner } from './components/ui/sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import MobileOptimizations from './components/mobile/MobileOptimizations';
import { SupabaseTaskDataProvider } from './context/SupabaseTaskDataProvider';
import { AuthProvider } from './context/AuthContextSupabase';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load pages for better performance
const Calendar = lazy(() => import('./pages/Calendar'));
const Customers = lazy(() => import('./pages/Customers'));
const Employees = lazy(() => import('./pages/Employees'));
const SupabaseSetupPage = lazy(() => import('./pages/SupabaseSetupPage'));
const Index = lazy(() => import('./pages/Index'));
const Kpi = lazy(() => import('./pages/Kpi'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const Reports = lazy(() => import('./pages/Reports'));
const Tasks = lazy(() => import('./pages/Tasks'));
const DetailedReports = lazy(() => import('./pages/DetailedReports'));
const Account = lazy(() => import('./pages/Account'));
const SimpleCustomers = lazy(() => import('./pages/SimpleCustomers'));
const CustomersSimple = lazy(() => import('./pages/CustomersSimple'));
const Settings = lazy(() => import('./pages/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SupabaseTaskDataProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <VersionChecker />
              <MobileOptimizations />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/supabase-setup" element={<SupabaseSetupPage />} />

                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <Tasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute>
                          <Calendar />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customers"
                      element={
                        <ProtectedRoute>
                          <Customers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employees"
                      element={
                        <ProtectedRoute>
                          <Employees />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/kpi"
                      element={
                        <ProtectedRoute>
                          <Kpi />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account-page"
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/detailed-reports"
                      element={
                        <ProtectedRoute>
                          <DetailedReports />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/simple-customers" element={<SimpleCustomers />} />
                    <Route path="/customers-simple" element={<CustomersSimple />} />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <Toaster />
              <Sonner />
            </div>
          </TooltipProvider>
        </SupabaseTaskDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
