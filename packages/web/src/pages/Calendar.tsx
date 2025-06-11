import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, BarChart3, Settings } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import CreatePlanModal from '@/components/planning/CreatePlanModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

const Calendar = () => {
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreatePlan = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handlePlanCreated = () => {
    // Force re-render by updating a state
    setIsCreateModalOpen(false);
    // The TaskCalendar will automatically refresh via useEffect
    console.log('Plan created successfully');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Kế hoạch"
        subtitle="Lập và theo dõi kế hoạch công việc hàng ngày"
        actions={
          <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo kế hoạch
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        <TaskCalendar onCreatePlan={handleCreatePlan} />
      </div>

      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        currentUser={currentUser}
        onPlanCreated={handlePlanCreated}
      />
    </AppLayout>
  );
};

export default Calendar;
