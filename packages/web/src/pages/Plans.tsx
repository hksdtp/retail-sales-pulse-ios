import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import PlanList from '@/components/planning/PlanList';
import CreatePlanModal from '@/components/planning/CreatePlanModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Plans = () => {
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
    
    // Force refresh plan list
    if ((window as any).refreshPlanList) {
      (window as any).refreshPlanList();
    }
    
    // Force refresh calendar plans
    if ((window as any).refreshCalendarPlans) {
      (window as any).refreshCalendarPlans();
    }
    
    console.log('Plan created successfully in Plans page');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Danh sách Kế hoạch"
        subtitle="Quản lý và theo dõi tất cả kế hoạch cá nhân"
        actions={
          <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo kế hoạch
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        <PlanList currentUser={currentUser} />
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

export default Plans;
