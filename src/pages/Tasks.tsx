
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import { Button } from '@/components/ui/button';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import { useAuth } from '@/context/AuthContext';

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentUser } = useAuth();
  
  const locationName = currentUser?.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
  const subtitle = `Theo dõi và quản lý các công việc của phòng kinh doanh - ${locationName}`;

  return (
    <AppLayout>
      <PageHeader 
        title="Quản lý công việc" 
        subtitle={subtitle}
        actions={
          <Button onClick={() => setIsFormOpen(true)}>Tạo công việc mới</Button>
        }
      />
      
      <div className="p-4 md:p-6">
        <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Thông tin người dùng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Tên:</span> {currentUser?.name}
            </div>
            <div>
              <span className="font-medium">Vai trò:</span> {
                currentUser?.role === 'director' ? 'Giám đốc Kinh doanh' :
                currentUser?.role === 'team_leader' ? 'Trưởng nhóm' : 'Nhân viên'
              }
            </div>
            <div>
              <span className="font-medium">Khu vực:</span> {locationName}
            </div>
          </div>
        </div>
        
        <TaskTabs />
      </div>

      <TaskFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
};

export default Tasks;
