
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import { Button } from '@/components/ui/button';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import { useAuth } from '@/context/AuthContext';
import GoogleSheetsConfig from '@/components/settings/GoogleSheetsConfig';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { Settings } from 'lucide-react';

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGoogleSheetsConfigOpen, setIsGoogleSheetsConfigOpen] = useState(false);
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

  // Tất cả người dùng đều có thể tạo công việc mới, nhân viên chỉ có thể tạo công việc cho chính mình
  const canCreateTask = true; // Cho phép tất cả người dùng tạo công việc

  return (
    <AppLayout>
      <PageHeader 
        title={headerTitle} 
        subtitle={subtitle}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsGoogleSheetsConfigOpen(true)} title="Cấu hình Google Sheets">
              <Settings className="h-4 w-4" />
            </Button>
            {canCreateTask && 
              <Button onClick={() => setIsFormOpen(true)}>
                {currentUser?.role === 'employee' ? 'Tạo công việc mới cho bản thân' : 'Tạo công việc mới'}
              </Button>
            }
          </div>
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
      <GoogleSheetsConfig 
        open={isGoogleSheetsConfigOpen} 
        onOpenChange={setIsGoogleSheetsConfigOpen} 
      />
    </AppLayout>
  );
};

export default Tasks;
