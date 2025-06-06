import { AlertCircle, Check, CloudOff } from 'lucide-react';
import { MapPin, RefreshCw, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useTaskData } from '@/hooks/use-task-data';

import { getLocationName, getTypeColor, getTypeName } from './task-utils/TaskFormatters';
import { Task } from './types/TaskTypes';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskKanbanProps {
  location?: string;
  teamId?: string;
}

const TaskKanban = ({ location = 'all', teamId = 'all' }: TaskKanbanProps) => {
  const { teams, users, currentUser } = useAuth();
  const { tasks, isLoading, refreshTasks } = useTaskData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Xác định xem dữ liệu đang được sử dụng là mẫu hay thực
  const isUsingMockData = tasks.some(
    (task) =>
      task.id?.includes('task_1') || task.id?.includes('task_2') || task.id?.includes('task_3'),
  );

  // Thực hiện làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTasks();
      console.log('Làm mới dữ liệu thành công');
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('Tổng số công việc được tải:', tasks.length);
  }, [tasks]);

  // Tạo các cột với dữ liệu từ useTaskData
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'Chưa bắt đầu',
      tasks: tasks.filter((t) => t.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'Đang thực hiện',
      tasks: tasks.filter((t) => t.status === 'in-progress'),
    },
    {
      id: 'on-hold',
      title: 'Đang chờ',
      tasks: tasks.filter((t) => t.status === 'on-hold'),
    },
    {
      id: 'completed',
      title: 'Hoàn thành',
      tasks: tasks.filter((t) => t.status === 'completed'),
    },
  ];

  // Lọc dữ liệu theo khu vực, nhóm và vai trò người dùng
  const filteredColumns = columns.map((column) => {
    const filteredTasks = column.tasks.filter((task) => {
      // Lọc theo khu vực
      const matchLocation = location === 'all' || task.location === location;

      // Lọc theo quyền của người dùng
      let hasPermissionToView = false;

      if (currentUser) {
        if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
          // Giám đốc xem tất cả công việc
          hasPermissionToView = true;
        } else if (currentUser.role === 'team_leader') {
          // Trưởng nhóm chỉ xem công việc của nhóm mình
          const userTeam = teams.find((team) => team.leader_id === currentUser.id);
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
      tasks: filteredTasks,
    };
  });

  // Tìm thông tin nhóm và người được giao
  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Không xác định';
  };

  const getAssignee = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user
      ? { name: user.name, avatar: user.name.charAt(0) }
      : { name: 'Không xác định', avatar: '?' };
  };

  // Kiểm tra nếu không có công việc nào thỏa mãn điều kiện lọc
  const hasAnyTasks = filteredColumns.some((column) => column.tasks.length > 0);

  if (isLoading) {
    return (
      <Card className="border border-dashed shadow-none">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu công việc...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyTasks) {
    return (
      <Card className="border border-dashed shadow-none">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Làm mới dữ liệu
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isUsingMockData ? (
                <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                  <CloudOff className="h-3 w-3" />
                  <span>Dữ liệu ngoại tuyến</span>
                  <div className="group relative">
                    <AlertCircle className="h-3 w-3 cursor-help" />
                    <div className="hidden group-hover:block absolute right-0 top-0 translate-x-full translate-y-[-100%] bg-black text-white text-xs rounded p-1 w-48">
                      Đang sử dụng dữ liệu mẫu vì không kết nối được với Google Sheets
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">
                  <Check className="h-3 w-3" />
                  <span>Đã đồng bộ</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">Không có công việc nào phù hợp với điều kiện lọc</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredColumns.map((column) => (
        <div key={column.id} className="flex flex-col">
          <div className="bg-muted px-4 py-2 mb-2 rounded-md font-medium flex justify-between items-center">
            <span>{column.title}</span>
            <Badge variant="outline">{column.tasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <Card
                key={task.id}
                className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.isNew && (
                          <Badge variant="default" className="bg-ios-red text-white ml-2">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getTypeColor(task.type)}>{getTypeName(task.type)}</Badge>
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
                      <div className="text-xs text-muted-foreground">Người thực hiện:</div>
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
