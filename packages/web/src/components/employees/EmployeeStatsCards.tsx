import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Building, 
  MapPin, 
  TrendingUp, 
  Award 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Team } from '@/types/user';

interface EmployeeStatsCardsProps {
  users: User[];
  teams: Team[];
}

const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({ users, teams }) => {
  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    directors: users.filter(u => u.role === 'retail_director').length,
    teamLeaders: users.filter(u => u.role === 'team_leader').length,
    employees: users.filter(u => u.role === 'employee').length,
    hanoi: users.filter(u => u.location === 'Hà Nội' || u.location === 'hanoi').length,
    hcm: users.filter(u => u.location === 'Hồ Chí Minh' || u.location === 'hcm').length,
    totalTeams: teams.length,
    activeTeams: teams.filter(t => {
      const teamMembers = users.filter(u => u.team_id === t.id);
      return teamMembers.length > 0;
    }).length
  };

  const statsCards = [
    {
      title: 'Tổng nhân viên',
      value: stats.total,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: `${stats.active} đang hoạt động`
    },
    {
      title: 'Trưởng phòng',
      value: stats.directors,
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Cấp quản lý'
    },
    {
      title: 'Trưởng nhóm',
      value: stats.teamLeaders,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'Quản lý nhóm'
    },
    {
      title: 'Nhân viên',
      value: stats.employees,
      icon: Users,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      description: 'Nhân viên thực thi'
    },
    {
      title: 'Nhóm làm việc',
      value: stats.totalTeams,
      icon: Building,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      description: `${stats.activeTeams} nhóm hoạt động`
    },
    {
      title: 'Địa điểm',
      value: 2,
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: `HN: ${stats.hanoi}, HCM: ${stats.hcm}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              
              {/* Progress bar for active percentage */}
              {stat.title === 'Tổng nhân viên' && stats.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Tỷ lệ hoạt động</span>
                    <span>{Math.round((stats.active / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.active / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Team activity for teams card */}
              {stat.title === 'Nhóm làm việc' && stats.totalTeams > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Nhóm có thành viên</span>
                    <span>{Math.round((stats.activeTeams / stats.totalTeams) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.activeTeams / stats.totalTeams) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Location distribution for location card */}
              {stat.title === 'Địa điểm' && stats.total > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Hà Nội
                    </Badge>
                    <span className="text-xs text-gray-600">{stats.hanoi}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      HCM
                    </Badge>
                    <span className="text-xs text-gray-600">{stats.hcm}</span>
                  </div>
                </div>
              )}

              {/* Role distribution for role cards */}
              {(stat.title === 'Trưởng phòng' || stat.title === 'Trưởng nhóm' || stat.title === 'Nhân viên') && stats.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Tỷ lệ</span>
                    <span>{Math.round((stat.value / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(stat.value / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default EmployeeStatsCards;
