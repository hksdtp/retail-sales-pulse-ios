
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Kpi from "./pages/Kpi";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider className="mx-[120px] my-0 px-0 py-0 bg-slate-50 rounded-full">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute>
                  <Index />
                </ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>} />
              <Route path="/kpi" element={<ProtectedRoute>
                  <Kpi />
                </ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute>
                  <Reports />
                </ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute>
                  <Employees />
                </ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>;

export default App;
