import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import FirebaseAutoSetupProvider from './components/firebase/FirebaseAutoSetupProvider';
import VersionChecker from './components/layout/VersionChecker';
import { Toaster as Sonner } from './components/ui/sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { ApiTaskDataProvider } from './context/ApiTaskDataProvider';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Calendar from './pages/Calendar';

import Employees from './pages/Employees';
import FirebaseSetup from './pages/FirebaseSetup';
import Index from './pages/Index';
import Kpi from './pages/Kpi';
import Login from './pages/Login';
import MobileTest from './pages/MobileTest';
import NotFound from './pages/NotFound';
import AccountPage from './pages/AccountPage';

import Reports from './pages/Reports';
import Tasks from './pages/Tasks';
import TaskFormDemo from './components/tasks/TaskFormDemo';

import DetailedReports from './pages/DetailedReports';
import ThemeDemo from './pages/ThemeDemo';
import Account from './pages/Account';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FirebaseAutoSetupProvider>
        <AuthProvider>
          <ApiTaskDataProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <VersionChecker />
            <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/firebase-setup" element={<FirebaseSetup />} />
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
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ApiTaskDataProvider>
        </AuthProvider>
      </FirebaseAutoSetupProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
