
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import { Button } from '@/components/ui/button';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AppLayout>
      <PageHeader 
        title="Quản lý công việc" 
        subtitle="Theo dõi và quản lý các công việc của phòng kinh doanh"
        actions={
          <Button onClick={() => setIsFormOpen(true)}>Tạo công việc mới</Button>
        }
      />
      
      <div className="p-4 md:p-6">
        <TaskTabs />
      </div>

      <TaskFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
};

export default Tasks;
