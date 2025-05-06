
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import { Button } from '@/components/ui/button';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import { useAuth } from '@/context/AuthContext';

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentUser, teams } = useAuth();
  
  // Xác định vị trí và tiêu đề phù hợp với vai trò
  const locationName = currentUser?.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
  
  let subtitle = '';
  let headerTitle = 'Quản lý công việc';
  
  if (currentUser?.role === 'director') {
    subtitle = `Theo dõi và quản lý tất cả công việc của phòng kinh doanh`;
  } else if (currentUser?.role === 'team_leader') {
    const userTeam = teams.find(team => team.leader_id === currentUser.id);
    subtitle = `Theo dõi và quản lý công việc của ${userTeam?.name || 'nhóm'} - ${locationName}`;
  } else {
    subtitle = `Theo dõi công việc được giao - ${locationName}`;
    headerTitle = 'Công việc của tôi';
  }

  // Chỉ giám đốc và trưởng nhóm có thể tạo công việc mới
  const canCreateTask = currentUser?.role === 'director' || currentUser?.role === 'team_leader';

  return (
    <AppLayout>
      <PageHeader 
        title={headerTitle} 
        subtitle={subtitle}
        actions={
          canCreateTask && 
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
