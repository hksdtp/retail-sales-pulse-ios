import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Eye, Mail, MapPin } from 'lucide-react';
import { User, Team } from '@/types/user';

interface OrganizationChartProps {
  users: User[];
  teams: Team[];
  onEmployeeAction: (employee: User, action: 'view' | 'contact') => void;
}

const OrganizationChart: React.FC<OrganizationChartProps> = ({
  users,
  teams,
  onEmployeeAction
}) => {
  const [activeTab, setActiveTab] = useState('hanoi');

  // Lấy director
  const director = users.find(user => user.role === 'retail_director');

  // Lấy team leaders theo chi nhánh
  const hanoiTeamLeaders = users.filter(user =>
    user.role === 'team_leader' && user.location === 'Hà Nội'
  );

  const hcmTeamLeaders = users.filter(user =>
    user.role === 'team_leader' && user.location === 'Hồ Chí Minh'
  );
  
  // Lấy nhân viên theo team
  const getTeamMembers = (teamId: string) => {
    return users.filter(user => 
      user.role === 'employee' && user.team_id === teamId
    );
  };
  
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || `Team ${teamId}`;
  };

  const getAvatarText = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[words.length - 2][0] + words[words.length - 1][0];
    }
    return words[0].slice(0, 2);
  };

  // Component để render team leaders và members
  const renderTeamSection = (teamLeaders: User[], colorScheme: string, borderColor: string) => (
    <div className="space-y-8">
      {/* Team Leaders Level - Ngang hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {teamLeaders.map((teamLeader, tlIndex) => {
          const teamMembers = getTeamMembers(teamLeader.team_id || '');

          return (
            <motion.div
              key={teamLeader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tlIndex * 0.1 }}
              className="space-y-4"
            >
              {/* Team Leader Card */}
              <Card className={`shadow-lg border-0 bg-gradient-to-br ${colorScheme} backdrop-blur-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className={`w-16 h-16 mb-4 ring-2 ${borderColor} shadow-md`}>
                      <AvatarImage src={teamLeader.avatar} alt={teamLeader.name} />
                      <AvatarFallback className={`bg-gradient-to-br ${colorScheme === 'from-blue-50 to-indigo-50' ? 'from-blue-500 to-indigo-600' : 'from-green-500 to-emerald-600'} text-white text-lg font-semibold`}>
                        {getAvatarText(teamLeader.name)}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{teamLeader.name}</h3>
                    <Badge className={`${colorScheme === 'from-blue-50 to-indigo-50' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'} mb-3`}>
                      Trưởng nhóm
                    </Badge>

                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Building className="w-4 h-4" />
                        <span>{getTeamName(teamLeader.team_id || '')}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{teamMembers.length} thành viên</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${colorScheme === 'from-blue-50 to-indigo-50' ? 'hover:bg-blue-50' : 'hover:bg-green-50'}`}
                        onClick={() => onEmployeeAction(teamLeader, 'view')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEmployeeAction(teamLeader, 'contact')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              {teamMembers.length > 0 && (
                <div className={`space-y-3 pl-4 border-l-2 ${borderColor.replace('ring-', 'border-')}`}>
                  {teamMembers.map((member, memberIndex) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + memberIndex * 0.05 }}
                      className="relative"
                    >
                      <div className={`absolute left-0 top-1/2 w-4 h-px ${borderColor.replace('ring-', 'bg-')}`}></div>

                      <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ml-4">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 ring-1 ring-gray-200">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white font-medium">
                                {getAvatarText(member.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                              <p className="text-sm text-gray-500 truncate">{member.email}</p>
                              {member.position && (
                                <p className="text-xs text-gray-400 truncate">{member.position}</p>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEmployeeAction(member, 'view')}
                                className="hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEmployeeAction(member, 'contact')}
                                className={`${colorScheme === 'from-blue-50 to-indigo-50' ? 'hover:bg-blue-50' : 'hover:bg-green-50'}`}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Director Level */}
      {director && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-lg hover:shadow-3xl transition-all duration-300 w-80">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <Avatar className="w-24 h-24 ring-4 ring-purple-200 shadow-lg">
                    <AvatarImage src={director.avatar} alt={director.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold">
                      {getAvatarText(director.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">👑</span>
                  </div>
                </div>

                <h2 className="font-bold text-xl text-gray-900 mb-2">{director.name}</h2>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-4 text-sm px-3 py-1">
                  Trưởng phòng
                </Badge>

                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Phòng Kinh Doanh</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{director.location}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-purple-50"
                    onClick={() => onEmployeeAction(director, 'view')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEmployeeAction(director, 'contact')}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-gray-300"></div>
      </div>

      {/* Tabs for Branches */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="hanoi" className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Hà Nội ({hanoiTeamLeaders.length} nhóm)
          </TabsTrigger>
          <TabsTrigger value="hcm" className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            TP.HCM ({hcmTeamLeaders.length} nhóm)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hanoi" className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTeamSection(hanoiTeamLeaders, 'from-blue-50 to-indigo-50', 'ring-blue-200')}
          </motion.div>
        </TabsContent>

        <TabsContent value="hcm" className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTeamSection(hcmTeamLeaders, 'from-green-50 to-emerald-50', 'ring-green-200')}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationChart;
