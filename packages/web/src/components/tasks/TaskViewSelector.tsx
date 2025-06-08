import { motion } from 'framer-motion';
import { Building2, Eye, User, Users } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export type TaskViewLevel = 'department' | 'team' | 'individual' | 'personal' | 'shared';

interface TaskViewSelectorProps {
  currentUser: any;
  selectedView: TaskViewLevel;
  onViewChange: (view: TaskViewLevel) => void;
  taskCounts?: {
    department: number;
    team: number;
    individual: number;
    personal: number;
    shared: number;
  };
}

const TaskViewSelector: React.FC<TaskViewSelectorProps> = ({
  currentUser,
  selectedView,
  onViewChange,
  taskCounts = { department: 0, team: 0, individual: 0, personal: 0, shared: 0 },
}) => {
  const isDirector =
    currentUser?.role === 'retail_director' || currentUser?.role === 'project_director';
  const isTeamLeader = currentUser?.role === 'team_leader';
  const isManager = isDirector || isTeamLeader;

  if (!isManager) {
    return null;
  }

  const viewOptions = [
    {
      id: 'personal' as TaskViewLevel,
      label: 'Công việc của tôi',
      icon: User,
      description: 'Công việc được giao cho bản thân',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      count: taskCounts.personal,
      available: true,
    },
    {
      id: 'shared' as TaskViewLevel,
      label: 'Công việc Chung',
      icon: Users,
      description: 'Công việc chung của cả phòng - mọi người đều thấy',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      hoverColor: 'hover:bg-yellow-100',
      count: taskCounts.shared,
      available: true,
    },
    {
      id: 'team' as TaskViewLevel,
      label: 'Công việc của Nhóm',
      icon: Users,
      description: 'Công việc được giao cho cả nhóm (team-level tasks)',
      color: 'bg-green-50 text-green-700 border-green-200',
      hoverColor: 'hover:bg-green-100',
      count: taskCounts.team,
      available: isManager,
    },
    {
      id: 'individual' as TaskViewLevel,
      label: 'Công việc Thành viên',
      icon: Eye,
      description: 'Công việc cá nhân của từng nhân viên và trưởng nhóm',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      count: taskCounts.individual,
      available: isManager,
    },
    {
      id: 'department' as TaskViewLevel,
      label: 'Toàn Phòng',
      icon: Building2,
      description: 'Tất cả công việc trong phòng ban (chỉ trưởng phòng)',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      count: taskCounts.department,
      available: isDirector,
    },
  ];

  const availableOptions = viewOptions.filter((option) => option.available);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Chế độ xem công việc</h3>
        <span className="text-sm text-gray-500">
          (
          {currentUser?.role === 'retail_director'
            ? 'Trưởng Phòng Bán Lẻ'
            : currentUser?.role === 'project_director'
              ? 'Giám Đốc Dự Án'
              : `Trưởng Nhóm - ${currentUser?.name}`}
          )
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {availableOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedView === option.id;

          return (
            <motion.div key={option.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onViewChange(option.id)}
                className={`
                  w-full h-auto p-4 flex flex-col items-center gap-2 text-left
                  ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                      : `${option.color} ${option.hoverColor} border-2`
                  }
                  transition-all duration-200
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : ''}`} />
                  <span
                    className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                  >
                    {option.count}
                  </span>
                </div>

                <div className="w-full">
                  <div className={`font-medium text-sm ${isSelected ? 'text-white' : ''}`}>
                    {option.label}
                  </div>
                  <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {isDirector && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">Quyền Trưởng Phòng:</span>
            <span>Có thể xem tất cả công việc trong phòng ban</span>
          </div>
        </div>
      )}

      {isTeamLeader && !isDirector && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Users className="h-4 w-4" />
            <span className="font-medium">Quyền Trưởng Nhóm ({currentUser?.name}):</span>
            <span>Chỉ xem công việc của thành viên trong Team {currentUser?.team_id}</span>
          </div>
          <div className="mt-2 text-xs text-green-600">
            🔒 Bảo mật: Không thể xem công việc của team khác
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskViewSelector;
