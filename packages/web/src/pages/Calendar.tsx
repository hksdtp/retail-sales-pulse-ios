import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import ModernCalendar from '@/components/calendar/ModernCalendar';
import SimpleCreatePlanModal from '@/components/planning/SimpleCreatePlanModal';
import EditPlanModal from '@/components/planning/EditPlanModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { personalPlanService, PersonalPlan } from '@/services/PersonalPlanService';

const Calendar = () => {
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PersonalPlan | null>(null);

  const handleCreatePlan = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handlePlanCreated = () => {
    // Force re-render by updating a state
    setIsCreateModalOpen(false);

    // Refresh ModernCalendar
    if ((window as any).refreshModernCalendar) {
      (window as any).refreshModernCalendar();
    }

    // Also refresh other calendar components if they exist
    if ((window as any).refreshCalendarPlans) {
      (window as any).refreshCalendarPlans();
    }

    console.log('Plan created successfully - ModernCalendar refreshed');
  };

  const handleEditPlan = (plan: PersonalPlan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (!currentUser?.id) return;

    try {
      const success = personalPlanService.deletePlan(currentUser.id, planId);
      if (success) {
        // Refresh ModernCalendar
        if ((window as any).refreshModernCalendar) {
          (window as any).refreshModernCalendar();
        }
        console.log('Plan deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Có lỗi xảy ra khi xóa kế hoạch');
    }
  };

  const handlePlanUpdated = () => {
    setIsEditModalOpen(false);
    setEditingPlan(null);

    // Refresh ModernCalendar
    if ((window as any).refreshModernCalendar) {
      (window as any).refreshModernCalendar();
    }

    console.log('Plan updated successfully - ModernCalendar refreshed');
  };

  return (
    <AppLayout>
      <PageHeader
        title="📅 Lịch Kế hoạch"
        subtitle="Quản lý và theo dõi kế hoạch công việc hàng ngày"
        actions={
          <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo kế hoạch
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        <ModernCalendar
          onCreatePlan={handleCreatePlan}
          onEditPlan={handleEditPlan}
          onDeletePlan={handleDeletePlan}
        />
      </div>

      <SimpleCreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        currentUser={currentUser}
        onPlanCreated={handlePlanCreated}
      />

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
        currentUser={currentUser}
        onPlanUpdated={handlePlanUpdated}
      />
    </AppLayout>
  );
};

export default Calendar;
