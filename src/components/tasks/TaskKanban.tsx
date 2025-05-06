
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { MapPin, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  date: string;
  isNew: boolean;
  location: 'hanoi' | 'hcm';
  teamId: string;
  assignedTo: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskKanbanProps {
  location?: string;
  teamId?: string;
}

// Dữ liệu mẫu mở rộng với thông tin về khu vực, nhóm và người được giao
const tasks: Task[] = [
  {
    id: '1',
    title: 'Gặp đối tác ABC',
    description: 'Thảo luận về hợp tác mới',
    type: 'partner',
    date: '10/05/2025',
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-1'
  },
  {
    id: '2',
    title: 'Báo giá dự án X',
    description: 'Chuẩn bị báo giá cho khách hàng',
    type: 'quote',
    date: '12/05/2025',
    isNew: true,
    location: 'hcm',
    teamId: 'team-3',
    assignedTo: 'user-4'
  },
  {
    id: '3',
    title: 'Khảo sát công trình Y',
    description: 'Đo đạc và đánh giá hiện trạng',
    type: 'client',
    date: '08/05/2025',
    isNew: false,
    location: 'hcm',
    teamId: 'team-2',
    assignedTo: 'user-2'
  },
  {
    id: '4',
    title: 'Làm việc với KTS Nguyễn',
    description: 'Trao đổi về thiết kế mới',
    type: 'architect',
    date: '09/05/2025',
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-3'
  },
  {
    id: '5',
    title: 'Phản hồi báo giá',
    description: 'Chờ khách hàng phản hồi',
    type: 'quote',
    date: '05/05/2025',
    isNew: false,
    location: 'hanoi',
    teamId: 'team-2',
    assignedTo: 'user-5'
  },
  {
    id: '6',
    title: 'Ký hợp đồng với Z',
    description: 'Hoàn tất thủ tục ký kết',
    type: 'client',
    date: '01/05/2025',
    isNew: false,
    location: 'hcm',
    teamId: 'team-1',
    assignedTo: 'user-6'
  },
];

const columns: Column[] = [
  {
    id: 'todo',
    title: 'Chưa bắt đầu',
    tasks: tasks.filter(t => t.id === '1' || t.id === '2')
  },
  {
    id: 'in-progress',
    title: 'Đang thực hiện',
    tasks: tasks.filter(t => t.id === '3' || t.id === '4')
  },
  {
    id: 'on-hold',
    title: 'Đang chờ',
    tasks: tasks.filter(t => t.id === '5')
  },
  {
    id: 'completed',
    title: 'Hoàn thành',
    tasks: tasks.filter(t => t.id === '6')
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'partner': return 'bg-ios-blue text-white';
    case 'architect': return 'bg-ios-green text-white';
    case 'client': return 'bg-ios-orange text-white';
    case 'quote': return 'bg-ios-yellow text-black';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'partner': return 'Đối tác';
    case 'architect': return 'KTS';
    case 'client': return 'Khách hàng';
    case 'quote': return 'Báo giá';
    default: return type;
  }
};

const getLocationName = (location: string) => {
  return location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
};

const TaskKanban = ({ location = 'all', teamId = 'all' }: TaskKanbanProps) => {
  const { teams, users, currentUser } = useAuth();

  // Lọc dữ liệu theo khu vực, nhóm và vai trò người dùng
  const filteredColumns = columns.map(column => {
    const filteredTasks = column.tasks.filter(task => {
      // Lọc theo khu vực
      const matchLocation = location === 'all' || task.location === location;
      
      // Lọc theo quyền của người dùng
      let hasPermissionToView = false;
      
      if (currentUser) {
        if (currentUser.role === 'director') {
          // Giám đốc xem tất cả công việc
          hasPermissionToView = true;
        } else if (currentUser.role === 'team_leader') {
          // Trưởng nhóm chỉ xem công việc của nhóm mình
          const userTeam = teams.find(team => team.leader_id === currentUser.id);
          hasPermissionToView = userTeam ? task.teamId === userTeam.id : false;
        } else {
          // Nhân viên chỉ xem công việc được giao cho mình
          hasPermissionToView = task.assignedTo === currentUser.id;
        }
      }
      
      // Lọc theo nhóm nếu được chọn
      const matchTeam = teamId === 'all' || task.teamId === teamId;
      
      return matchLocation && matchTeam && hasPermissionToView;
    });

    return {
      ...column,
      tasks: filteredTasks
    };
  });

  // Tìm thông tin nhóm và người được giao
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Không xác định';
  };
  
  const getAssignee = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? { name: user.name, avatar: user.name.charAt(0) } : { name: 'Không xác định', avatar: '?' };
  };

  // Kiểm tra nếu không có công việc nào thỏa mãn điều kiện lọc
  const hasAnyTasks = filteredColumns.some(column => column.tasks.length > 0);

  if (!hasAnyTasks) {
    return (
      <Card className="border border-dashed shadow-none">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">Không có công việc nào phù hợp với điều kiện lọc</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredColumns.map(column => (
        <div key={column.id} className="flex flex-col">
          <div className="bg-muted px-4 py-2 mb-2 rounded-md font-medium flex justify-between items-center">
            <span>{column.title}</span>
            <Badge variant="outline">{column.tasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map(task => (
              <Card key={task.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.isNew && (
                          <Badge variant="default" className="bg-ios-red text-white ml-2">Mới</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getTypeColor(task.type)}`}>
                        {getTypeName(task.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.date}</span>
                    </div>
                    
                    <div className="flex items-center text-xs gap-2 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{getLocationName(task.location)}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{getTeamName(task.teamId)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground">
                        Người thực hiện:
                      </div>
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-ios-blue text-white text-xs">
                            {getAssignee(task.assignedTo).avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{getAssignee(task.assignedTo).name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {column.tasks.length === 0 && (
              <Card className="border border-dashed shadow-none">
                <CardContent className="p-4 flex items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground">Không có công việc nào</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskKanban;
