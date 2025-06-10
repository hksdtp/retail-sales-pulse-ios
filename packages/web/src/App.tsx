import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import FirebaseAutoSetupProvider from './components/firebase/FirebaseAutoSetupProvider';
import { SidebarProvider } from './components/ui/sidebar';
import { Toaster as Sonner } from './components/ui/sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { ApiTaskDataProvider } from './context/ApiTaskDataProvider';
import { AuthProvider } from './context/AuthContext';
import Calendar from './pages/Calendar';
import Employees from './pages/Employees';
import FirebaseSetup from './pages/FirebaseSetup';
import Index from './pages/Index';
import Kpi from './pages/Kpi';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';
import TaskFormDemo from './components/tasks/TaskFormDemo';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAutoSetupProvider>
      <AuthProvider>
        <ApiTaskDataProvider>
          <TooltipProvider>
            <SidebarProvider className="mx-[120px] my-0 px-0 py-0 bg-slate-50 rounded-full">
              <Toaster />
              <Sonner />
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
                    path="/task-form-demo"
                    element={
                      <ProtectedRoute>
                        <TaskFormDemo />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ApiTaskDataProvider>
      </AuthProvider>
    </FirebaseAutoSetupProvider>
  </QueryClientProvider>
);

export default App;
