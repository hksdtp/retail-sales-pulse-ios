
import React, { useState, useEffect } from 'react';
import { Plus, Users, UserRound } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import { Button } from '@/components/ui/button';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import { useAuth } from '@/context/AuthContext';
import GoogleSheetsConfig from '@/components/settings/GoogleSheetsConfig';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGoogleSheetsConfigOpen, setIsGoogleSheetsConfigOpen] = useState(false);
  const [taskFormType, setTaskFormType] = useState<'self' | 'team' | 'individual'>('self');
  const { currentUser, teams } = useAuth();
  const { toast } = useToast();
  
  // Kiểm tra cấu hình Google Sheets khi trang được tải
  useEffect(() => {
    const isConfigured = googleSheetsService.isConfigured();
    if (isConfigured) {
      toast({
        title: "Đã sẵn sàng",
        description: "Google Sheets đã được cấu hình và đang hoạt động ở chế độ mô phỏng",
        duration: 5000
      });
    }
  }, [toast]);
  
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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsGoogleSheetsConfigOpen(true)} 
              title="Cấu hình Google Sheets"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Tất cả vai trò đều có nút này */}
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5 bg-white/80 hover:bg-white/90 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 shadow-sm"
              onClick={() => {
                setTaskFormType('self');
                setIsFormOpen(true);
              }}
            >
              <UserRound className="h-4 w-4" />
              <span>Tạo công việc cho bản thân</span>
            </Button>

            {/* Nếu là Khổng Đức Mạnh, Hà Xuân Trường hoặc vai trò Director */}
            {(currentUser?.name === 'Khổng Đức Mạnh' || 
              currentUser?.name === 'Hà Xuân Trường' || 
              currentUser?.role === 'director') && (
              <Button 
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] text-white shadow-md hover:opacity-90"
                onClick={() => {
                  setTaskFormType('team');
                  setIsFormOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
                <span>Giao việc cho Nhóm/Cá nhân</span>
              </Button>
            )}

            {/* Nếu là Trưởng nhóm và không phải Khổng Đức Mạnh */}
            {currentUser?.role === 'team_leader' && currentUser?.name !== 'Khổng Đức Mạnh' && (
              <Button 
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] text-white shadow-md hover:opacity-90"
                onClick={() => {
                  setTaskFormType('individual');
                  setIsFormOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
                <span>Giao việc cho thành viên</span>
              </Button>
            )}
            
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
                currentUser?.name === 'Khổng Đức Mạnh' ? 'Trưởng Phòng Kinh doanh bán lẻ' :
                currentUser?.name === 'Hà Xuân Trường' ? 'Trưởng Phòng Kinh Doanh Dự Án' :
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

      <TaskFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        formType={taskFormType}
      />
      <GoogleSheetsConfig 
        open={isGoogleSheetsConfigOpen} 
        onOpenChange={setIsGoogleSheetsConfigOpen} 
        onConfigSaved={() => {
          toast({
            title: "Cấu hình thành công",
            description: "Đã lưu cấu hình Google Sheets Service Account. Dữ liệu sẽ được lưu ở chế độ mô phỏng."
          });
        }}
      />
    </AppLayout>
  );
};

export default Tasks;
