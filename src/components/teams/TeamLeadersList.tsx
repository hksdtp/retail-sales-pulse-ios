import { Building2, MapPin, Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const TeamLeadersList: React.FC = () => {
  const { users, teams } = useAuth();

  // Lấy tất cả trưởng nhóm
  const teamLeaders = users.filter((user) => user.role === 'team_leader');

  // Lấy thông tin team cho mỗi trưởng nhóm
  const getTeamInfo = (teamId: string) => {
    return teams.find((team) => team.id === teamId);
  };

  const getLocationLabel = (location: string) => {
    return location === 'hanoi' ? 'Hà Nội' : 'TP. Hồ Chí Minh';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Danh sách Trưởng Nhóm
          <Badge variant="secondary" className="ml-2">
            {teamLeaders.length} người
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamLeaders.map((leader) => {
            const teamInfo = getTeamInfo(leader.team_id || '');

            return (
              <div
                key={leader.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-green-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{leader.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{leader.position || 'Trưởng nhóm'}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    ID: {leader.id}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Nhóm:</span>
                    <span>{teamInfo?.name || `Team ${leader.team_id}`}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Địa điểm:</span>
                    <span>{getLocationLabel(leader.location)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Phòng ban:</span>
                    <span>{leader.department_type === 'retail' ? 'Bán lẻ' : 'Dự án'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Email:</span>
                    <span className="text-blue-600">{leader.email}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={leader.status === 'active' ? 'default' : 'secondary'}
                      className={leader.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {leader.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>

                    <div className="text-xs text-gray-500">Team ID: {leader.team_id}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {teamLeaders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Không có trưởng nhóm nào trong hệ thống</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamLeadersList;
