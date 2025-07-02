import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import VersionChecker from './components/layout/VersionChecker';
// import GlobalPasswordChangeModal from './components/login/GlobalPasswordChangeModal'; // REMOVED - Duplicate modal

import { Toaster as Sonner } from './components/ui/sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import MobileOptimizations from './components/mobile/MobileOptimizations';
import { SupabaseTaskDataProvider } from './context/SupabaseTaskDataProvider';
import { AuthProvider } from './context/AuthContextSupabase';
import { ThemeProvider } from './context/ThemeContext';
import Calendar from './pages/Calendar';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import SupabaseSetupPage from './pages/SupabaseSetupPage';
import Index from './pages/Index';
import Kpi from './pages/Kpi';
import Login from './pages/Login';
import MobileTest from './pages/MobileTest';
import MobileOptimizationTest from './pages/MobileOptimizationTest';
import NotFound from './pages/NotFound';
import AccountPage from './pages/AccountPage';

import Reports from './pages/Reports';
import Tasks from './pages/Tasks';
import TaskFormDemo from './components/tasks/TaskFormDemo';

import DetailedReports from './pages/DetailedReports';
import ThemeDemo from './pages/ThemeDemo';
import Account from './pages/Account';
import DebugPage from './pages/DebugPage';
import SimpleCustomers from './pages/SimpleCustomers';
import CustomerTest from './pages/CustomerTest';
import CustomersSimple from './pages/CustomersSimple';
import TestKPI from './pages/TestKPI';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SupabaseTaskDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <VersionChecker />
            {/* <GlobalPasswordChangeModal /> */} {/* REMOVED - Duplicate modal, ProtectedRoute handles this */}
            {/* <MobileOptimizations /> */}
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
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
                    path="/employees"
                    element={
                      <ProtectedRoute>
                        <Employees />
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
                    path="/mobile-test"
                    element={
                      <ProtectedRoute>
                        <MobileTest />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/task-form-demo"
                    element={
                      <ProtectedRoute>
                        <TaskFormDemo />
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
                  <Route
                    path="/theme-demo"
                    element={
                      <ProtectedRoute>
                        <ThemeDemo />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/debug" element={<DebugPage />} />
                  {/* <Route path="/mobile-test" element={<MobileOptimizationTest />} /> */}
                  <Route path="/simple-customers" element={<SimpleCustomers />} />
                  <Route path="/customer-test" element={<CustomerTest />} />
                  <Route path="/customers-simple" element={<CustomersSimple />} />
                  <Route
                    path="/test-kpi"
                    element={
                      <ProtectedRoute>
                        <TestKPI />
                      </ProtectedRoute>
                    }
                  />
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
              </BrowserRouter>
          </TooltipProvider>
        </SupabaseTaskDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
