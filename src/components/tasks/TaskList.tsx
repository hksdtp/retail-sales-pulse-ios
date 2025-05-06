
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, User, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  date: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  progress: number;
  isNew: boolean;
  location: 'hanoi' | 'hcm';
  teamId: string;
  assignedTo: string;
}

interface TaskListProps {
  location: string;
  teamId: string;
}

// Dữ liệu mẫu mở rộng với thông tin về khu vực, nhóm và người được giao
const tasks: Task[] = [
  {
    id: '1',
    title: 'Gặp đối tác ABC',
    description: 'Thảo luận về hợp tác mới',
    type: 'partner',
    date: '10:30',
    status: 'todo',
    progress: 0,
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-1'
  },
  {
    id: '3',
    title: 'Khảo sát công trình Y',
    description: 'Đo đạc và đánh giá hiện trạng',
    type: 'client',
    date: '14:00',
    status: 'in-progress',
    progress: 60,
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
    date: '09:00',
    status: 'in-progress',
    progress: 30,
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-3'
  },
  {
    id: '2',
    title: 'Báo giá dự án X',
    description: 'Chuẩn bị báo giá cho khách hàng',
    type: 'quote',
    date: '12/05/2025',
    status: 'todo',
    progress: 0,
    isNew: true,
    location: 'hcm',
    teamId: 'team-3',
    assignedTo: 'user-4'
  },
  {
    id: '5',
    title: 'Phản hồi báo giá',
    description: 'Chờ khách hàng phản hồi',
    type: 'quote',
    date: '07/05/2025',
    status: 'on-hold',
    progress: 80,
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
    status: 'completed',
    progress: 100,
    isNew: false,
    location: 'hcm',
    teamId: 'team-1',
    assignedTo: 'user-6'
  },
];

// Tạo danh sách nhóm công việc theo thời gian
const groupTasks = (filteredTasks: Task[]) => {
  const groups = {
    'Hôm nay (05/05/2025)': filteredTasks.filter(t => t.date === '10:30' || t.date === '14:00'),
    'Ngày mai (06/05/2025)': filteredTasks.filter(t => t.date === '09:00'),
    'Sắp tới': filteredTasks.filter(t => t.date === '12/05/2025' || t.date === '07/05/2025'),
    'Hoàn thành gần đây': filteredTasks.filter(t => t.status === 'completed'),
  };

  // Lọc bỏ các nhóm không có công việc nào
  return Object.fromEntries(
    Object.entries(groups).filter(([_, tasks]) => tasks.length > 0)
  );
};

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-ios-green';
    case 'in-progress': return 'bg-ios-blue';
    case 'on-hold': return 'bg-ios-yellow';
    case 'todo': return 'bg-gray-300';
    default: return 'bg-gray-200';
  }
};

const getLocationName = (location: string) => {
  return location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
};

const TaskList = ({ location, teamId }: TaskListProps) => {
  const { teams, users } = useAuth();
  
  // Lọc công việc dựa trên khu vực và nhóm đã chọn
  const filteredTasks = tasks.filter(task => {
    const matchLocation = location === 'all' || task.location === location;
    const matchTeam = teamId === 'all' || task.teamId === teamId;
    return matchLocation && matchTeam;
  });
  
  // Nhóm công việc theo thời gian
  const groupedTasks = groupTasks(filteredTasks);
  
  // Tìm thông tin nhóm và người được giao
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Không xác định';
  };
  
  const getAssigneeName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Không xác định';
  };

  // Hiển thị thông báo nếu không có công việc nào thỏa mãn điều kiện lọc
  if (Object.keys(groupedTasks).length === 0) {
    return (
      <Card className="border border-dashed shadow-none">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">Không có công việc nào phù hợp với điều kiện lọc</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([group, tasks]) => (
        <div key={group} className="space-y-3">
          <h3 className="font-medium text-lg">{group}</h3>
          
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Công việc</TableHead>
                  <TableHead className="w-[15%]">Loại</TableHead>
                  <TableHead className="w-[15%]">Khu vực</TableHead>
                  <TableHead className="w-[15%]">Nhóm</TableHead>
                  <TableHead className="w-[15%]">Người thực hiện</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${task.status === 'completed' ? 'bg-ios-green' : 'border border-gray-300'}`}>
                          {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {task.title}
                            {task.isNew && (
                              <Badge variant="default" className="bg-ios-red text-white">Mới</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className={`h-1.5 rounded-full ${getStatusColor(task.status)}`} 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(task.type)}`}>
                        {getTypeName(task.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{getLocationName(task.location)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span>{getTeamName(task.teamId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{getAssigneeName(task.assignedTo)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
