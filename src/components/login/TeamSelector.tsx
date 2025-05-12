
import React from 'react';
import { User, Team } from '@/types/user';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamSelectorProps {
  filteredTeams: Team[];
  users: User[];
  onTeamSelect: (team: Team) => void;
  onBack: () => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ 
  filteredTeams, 
  users,
  onTeamSelect, 
  onBack 
}) => {
  const getTeamMembers = (teamId: string) => {
    return users.filter(user => user.team_id === teamId);
  };

  const getAvatarText = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2 text-ios-blue" />
          Chọn nhóm
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-ios-blue"
        >
          Quay lại
        </Button>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {filteredTeams.map(team => {
          const teamMembers = getTeamMembers(team.id);
          const leader = users.find(user => user.id === team.leader_id);
          
          return (
            <div 
              key={team.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onTeamSelect(team)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 pr-2 flex-1">
                  <h3 className="font-medium text-lg truncate">{team.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{team.description}</p>
                </div>
                <Badge variant="outline" className="flex-shrink-0 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {teamMembers.length}
                </Badge>
              </div>
              
              {leader && (
                <div className="flex items-center mt-3">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarFallback className="bg-ios-blue text-white">
                      {getAvatarText(leader.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium block truncate">{leader.name}</span>
                    <div className="flex items-center">
                      <Badge className="mr-1 h-5 bg-ios-blue text-xs">Trưởng nhóm</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredTeams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có nhóm nào trong khu vực này
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelector;
