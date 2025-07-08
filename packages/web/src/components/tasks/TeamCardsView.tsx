import React from 'react';
import { Users, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContextSupabase';

interface TeamCardsViewProps {
  onTeamSelect: (teamId: string, teamName: string) => void;
}

interface TeamInfo {
  id: string;
  name: string;
  leader: string;
  location: string;
  memberCount: number;
  taskCount: number;
}

const TeamCardsView: React.FC<TeamCardsViewProps> = ({ onTeamSelect }) => {
  const { currentUser } = useAuth();

  // Định nghĩa các nhóm theo cấu trúc tổ chức
  const allTeams: TeamInfo[] = [
    // Hà Nội
    {
      id: '1',
      name: 'NHÓM 1 - VIỆT ANH',
      leader: 'Lương Việt Anh',
      location: 'Hà Nội',
      memberCount: 3,
      taskCount: 0
    },
    {
      id: '2', 
      name: 'NHÓM 2 - THẢO',
      leader: 'Nguyễn Thị Thảo',
      location: 'Hà Nội',
      memberCount: 2,
      taskCount: 0
    },
    {
      id: '3',
      name: 'NHÓM 3 - BỐN',
      leader: 'Trịnh Thị Bốn',
      location: 'Hà Nội',
      memberCount: 1,
      taskCount: 0
    },
    {
      id: '4',
      name: 'NHÓM 4 - HƯƠNG',
      leader: 'Phạm Thị Hương',
      location: 'Hà Nội',
      memberCount: 1,
      taskCount: 0
    },
    // Hồ Chí Minh
    {
      id: '5',
      name: 'NHÓM 1 - HCM',
      leader: 'Nguyễn Thị Nga',
      location: 'Hồ Chí Minh',
      memberCount: 2,
      taskCount: 0
    },
    {
      id: '6',
      name: 'NHÓM 2 - HCM',
      leader: 'Nguyễn Ngọc Việt Khanh',
      location: 'Hồ Chí Minh',
      memberCount: 2,
      taskCount: 0
    }
  ];

  // Filter teams dựa trên user permission
  const getVisibleTeams = (): TeamInfo[] => {
    // Chỉ Khổng Đức Mạnh (Director) mới thấy tất cả teams
    if (currentUser?.name === 'Khổng Đức Mạnh' || currentUser?.role === 'retail_director') {
      console.log('🔑 Director access: showing all teams');
      return allTeams;
    }

    // User thường chỉ thấy team của mình
    const userTeamId = currentUser?.team_id;
    if (userTeamId) {
      const userTeam = allTeams.filter(team => team.id === userTeamId);
      console.log(`👤 Regular user access: showing only team ${userTeamId}`, userTeam);
      return userTeam;
    }

    console.log('❌ No team access for user:', currentUser?.name);
    return [];
  };

  const teams = getVisibleTeams();

  // Nhóm theo địa điểm
  const teamsByLocation = teams.reduce((acc, team) => {
    if (!acc[team.location]) {
      acc[team.location] = [];
    }
    acc[team.location].push(team);
    return acc;
  }, {} as Record<string, TeamInfo[]>);

  const handleTeamClick = (team: TeamInfo) => {
    console.log('🎯 TeamCardsView handleTeamClick called:', team.name, 'ID:', team.id);
    console.log('🎯 onTeamSelect function available:', typeof onTeamSelect);
    onTeamSelect(team.id, team.name);
    console.log('🎯 onTeamSelect called successfully');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chọn nhóm để xem công việc
        </h3>
        <p className="text-sm text-gray-600">
          Click vào card nhóm để xem danh sách công việc của nhóm đó
        </p>
      </div>

      {Object.entries(teamsByLocation).map(([location, locationTeams]) => (
        <div key={location} className="space-y-4">
          {/* Location Header */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h4 className="text-md font-medium text-gray-900">{location}</h4>
            <span className="text-sm text-gray-500">({locationTeams.length} nhóm)</span>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleTeamClick(team)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">
                        {team.name}
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Team Leader */}
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Trưởng nhóm:</span> {team.leader}
                  </span>
                </div>

                {/* Team Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">{team.memberCount} thành viên</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">{team.taskCount} công việc</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-blue-600 font-medium">
                    Click để xem công việc nhóm →
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có nhóm nào
          </h3>
          <p className="text-gray-600">
            Hiện tại chưa có nhóm nào được thiết lập.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamCardsView;
