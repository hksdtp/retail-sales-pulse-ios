import { User } from 'lucide-react';
import React, { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TeamLeadersList from '@/components/teams/TeamLeadersList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';

const Employees = () => {
  const { users, teams } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'hanoi' | 'hcm'>('all');

  // Lọc nhân viên theo địa điểm
  const filteredUsers = selectedLocation === 'all'
    ? users
    : users.filter((user) => {
        if (selectedLocation === 'hanoi') {
          return user.location === 'Hà Nội' || user.location === 'hanoi';
        }
        if (selectedLocation === 'hcm') {
          return user.location === 'Hồ Chí Minh' || user.location === 'hcm';
        }
        return user.location === selectedLocation;
      });

  // Tìm tên nhóm theo team_id
  const getTeamName = (teamId: string) => {
    if (teamId === '0' || !teamId) return 'Chưa có nhóm';
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Chưa có nhóm';
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'retail_director':
        return 'Trưởng phòng';
      case 'team_leader':
        return 'Trưởng nhóm';
      case 'employee':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  const getLocationName = (location: string) => {
    if (location === 'hanoi' || location === 'Hà Nội') return 'Hà Nội';
    if (location === 'hcm' || location === 'Hồ Chí Minh') return 'Hồ Chí Minh';
    return location;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Quản lý nhân viên"
        subtitle="Thông tin chi tiết về nhân viên phòng kinh doanh"
        actions={<Button>Thêm nhân viên</Button>}
      />

      <div className="p-4 md:p-6">
        <Card className="shadow-sm mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-medium mb-2 md:mb-0">Danh sách nhân viên</h2>
              <div className="w-full md:w-64">
                <Select
                  value={selectedLocation}
                  onValueChange={(value: 'all' | 'hanoi' | 'hcm') => setSelectedLocation(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Nhóm</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{getRoleName(user.role)}</TableCell>
                    <TableCell>{getTeamName(user.team_id)}</TableCell>
                    <TableCell>{getLocationName(user.location)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Không có nhân viên nào trong khu vực này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Danh sách trưởng nhóm */}
        <div className="mb-6">
          <TeamLeadersList />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams
            .filter((team) => {
              if (selectedLocation === 'all') return true;
              if (selectedLocation === 'hanoi') {
                return team.location === 'Hà Nội' || team.location === 'hanoi';
              }
              if (selectedLocation === 'hcm') {
                return team.location === 'Hồ Chí Minh' || team.location === 'hcm';
              }
              return team.location === selectedLocation;
            })
            .map((team) => {
              const teamLeader = users.find((user) => user.id === team.leader_id);
              const teamMembers = users.filter(
                (user) => user.team_id === team.id && user.id !== team.leader_id,
              );

              return (
                <Card key={team.id} className="shadow-sm">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-medium text-lg mb-2">{team.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{team.description}</p>

                    {teamLeader && (
                      <div className="mb-3">
                        <Badge className="bg-ios-blue mb-2">Trưởng nhóm</Badge>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-ios-blue rounded-full flex items-center justify-center text-white">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{teamLeader.name}</p>
                            <p className="text-sm text-muted-foreground">{teamLeader.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {teamMembers.length > 0 && (
                      <div>
                        <Badge className="bg-gray-200 text-gray-800 mb-2">Thành viên</Badge>
                        <div className="space-y-3">
                          {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {teamMembers.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Chưa có thành viên</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Employees;
