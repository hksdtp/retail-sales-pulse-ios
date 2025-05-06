
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TaskKanban from './TaskKanban';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Users, Filter } from 'lucide-react';

const TaskTabs = () => {
  const [view, setView] = useState('kanban');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  
  const { teams, currentUser } = useAuth();
  
  // Lấy danh sách khu vực để hiển thị trong bộ lọc
  const locations = [
    { id: 'all', name: 'Tất cả khu vực' },
    { id: 'hanoi', name: 'Hà Nội' },
    { id: 'hcm', name: 'Hồ Chí Minh' }
  ];

  // Thiết lập lọc mặc định dựa trên vai trò người dùng
  useEffect(() => {
    if (currentUser) {
      // Nếu là nhân viên hoặc trưởng nhóm, lọc theo khu vực của họ
      if (currentUser.role !== 'director') {
        setSelectedLocation(currentUser.location);
      }
      
      // Nếu là trưởng nhóm, tự động chọn nhóm của họ
      if (currentUser.role === 'team_leader') {
        const userTeam = teams.find(team => team.leader_id === currentUser.id);
        if (userTeam) {
          setSelectedTeam(userTeam.id);
        }
      }
      
      // Nếu là nhân viên thường, không cần chọn nhóm vì chỉ xem công việc của mình
      if (currentUser.role === 'employee') {
        setSelectedTeam('all'); // Không cần chọn nhóm vì lọc sẽ được áp dụng dựa trên ID của nhân viên
      }
    }
  }, [currentUser, teams]);

  // Lọc nhóm dựa trên khu vực được chọn và vai trò người dùng
  const filteredTeams = teams.filter(team => {
    // Trưởng nhóm chỉ thấy nhóm của mình
    if (currentUser?.role === 'team_leader') {
      return team.leader_id === currentUser.id;
    }
    
    // Nhân viên không cần chọn nhóm
    if (currentUser?.role === 'employee') {
      return false;
    }
    
    // Giám đốc có thể thấy tất cả các nhóm
    return selectedLocation === 'all' || team.location === selectedLocation;
  });

  // Xác định xem người dùng có thể chọn khu vực không
  const canSelectLocation = currentUser?.role === 'director';
  
  // Xác định xem người dùng có thể chọn nhóm không
  const canSelectTeam = currentUser?.role === 'director' || currentUser?.role === 'team_leader';

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {canSelectLocation && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin size={16} />
                Khu vực
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {canSelectTeam && filteredTeams.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users size={16} />
                Nhóm
              </label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {filteredTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {currentUser?.role === 'director' && "Hiển thị tất cả công việc theo bộ lọc đã chọn"}
              {currentUser?.role === 'team_leader' && "Hiển thị các công việc của nhóm bạn quản lý"}
              {currentUser?.role === 'employee' && "Hiển thị các công việc được giao cho bạn"}
            </div>
          </div>
        </div>
      </Card>
      
      <Tabs value={view} onValueChange={setView} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="calendar">Lịch</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-0">
          <TaskKanban location={selectedLocation} teamId={selectedTeam} />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <TaskList location={selectedLocation} teamId={selectedTeam} />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          <TaskCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskTabs;
