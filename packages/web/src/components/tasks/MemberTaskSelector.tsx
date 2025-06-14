import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, User, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getTeamLeader } from '@/utils/teamUtils';

interface MemberTaskSelectorProps {
  selectedMemberId: string | null;
  onMemberChange: (memberId: string | null) => void;
  taskCounts?: { [memberId: string]: number };
}

const MemberTaskSelector: React.FC<MemberTaskSelectorProps> = ({
  selectedMemberId,
  onMemberChange,
  taskCounts = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { currentUser, users, teams } = useAuth();

  // Tính toán vị trí dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Lấy danh sách thành viên dựa trên role
  const getFilteredMembers = () => {
    if (!currentUser || !users) return [];

    // Director có thể xem tất cả thành viên trong phòng ban (bao gồm cả team leaders)
    if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
      return users.filter(
        (user) => user.department_type === currentUser.department_type && user.id !== currentUser.id,
      );
    }

    // Team leader chỉ xem thành viên trong team
    if (currentUser.role === 'team_leader') {
      return users.filter(
        (user) => user.team_id === currentUser.team_id && user.id !== currentUser.id,
      );
    }

    // Nhân viên thường không xem được thành viên khác
    return [];
  };

  const teamMembers = getFilteredMembers();

  // Nhóm thành viên theo khu vực và team
  const groupMembersByLocation = () => {
    const grouped = teamMembers.reduce(
      (acc, member) => {
        const location =
          member.location === 'hanoi'
            ? 'Hà Nội'
            : member.location === 'hcm'
              ? 'Hồ Chí Minh'
              : 'Khác';

        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(member);
        return acc;
      },
      {} as Record<string, typeof teamMembers>,
    );

    return grouped;
  };

  const membersByLocation = groupMembersByLocation();

  // Tạo options với nhóm
  const createGroupedOptions = () => {
    const options = [
      {
        id: null,
        name: 'Tất cả thành viên',
        role: 'all',
        location: '',
        team_id: '',
        count: Object.values(taskCounts).reduce((sum, count) => sum + count, 0),
        isGroup: false,
      },
    ];

    // Thêm các nhóm theo khu vực
    Object.entries(membersByLocation).forEach(([location, members]) => {
      // Header cho khu vực
      options.push({
        id: `location-${location}`,
        name: `📍 ${location}`,
        role: 'location-header',
        location,
        team_id: '',
        count: 0,
        isGroup: true,
      });

      // Nhóm theo team trong khu vực
      const teamGroups = members.reduce(
        (acc, member) => {
          const teamKey = member.team_id || 'no-team';
          if (!acc[teamKey]) {
            acc[teamKey] = [];
          }
          acc[teamKey].push(member);
          return acc;
        },
        {} as Record<string, typeof members>,
      );

      Object.entries(teamGroups).forEach(([teamId, teamMembers]) => {
        // Header cho team với tên trưởng nhóm
        const team = teams?.find((t) => t.id === teamId);
        let teamName = teamId === 'no-team' ? 'Không thuộc nhóm' : team ? team.name : `Nhóm ${teamId}`;

        // Thêm tên trưởng nhóm nếu có
        if (teamId !== 'no-team' && team) {
          const leader = getTeamLeader(teamId, teams || [], users || []);
          if (leader) {
            teamName = `${team.name} - ${leader.name}`;
          }
        }

        options.push({
          id: `team-${teamId}`,
          name: `  👥 ${teamName}`,
          role: 'team-header',
          location,
          team_id: teamId,
          count: teamMembers.length,
          isGroup: true,
        });

        // Thành viên trong team
        teamMembers.forEach((member) => {
          options.push({
            id: member.id,
            name: `    • ${member.name}`,
            role: member.role,
            location: member.location,
            team_id: member.team_id,
            count: taskCounts[member.id] || 0,
            isGroup: false,
          });
        });
      });
    });

    return options;
  };

  const allOptions = createGroupedOptions();

  const selectedOption =
    allOptions.find((option) => option.id === selectedMemberId) || allOptions[0];

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Chọn thành viên để xem công việc:
        </h3>

        <Button
          ref={buttonRef}
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-12 px-4 bg-white border-2 border-gray-200 hover:border-blue-300"
        >
          <div className="flex items-center gap-3">
            {selectedMemberId ? (
              <User className="h-4 w-4 text-blue-600" />
            ) : (
              <Users className="h-4 w-4 text-green-600" />
            )}
            <div className="text-left">
              <div className="font-medium text-gray-900">{selectedOption.name}</div>
              <div className="text-xs text-gray-500">{selectedOption.count} công việc</div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {/* Render dropdown using portal */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 9999,
              }}
            >
              {allOptions.map((option) => {
                // Render group headers (không clickable)
                if (option.isGroup) {
                  return (
                    <div
                      key={option.id}
                      className={`
                      px-4 py-2 text-sm font-semibold
                      ${option.role === 'location-header' ? 'bg-gray-100 text-gray-700 border-t border-gray-200' : 'bg-gray-50 text-gray-600'}
                    `}
                    >
                      {option.name}
                      {option.role === 'team-header' && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({option.count} thành viên)
                        </span>
                      )}
                    </div>
                  );
                }

                // Render clickable members
                return (
                  <button
                    key={option.id || 'all'}
                    onClick={() => {
                      if (!option.isGroup) {
                        onMemberChange(option.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors
                    ${selectedMemberId === option.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    ${option.id === null ? 'border-b border-gray-200' : ''}
                  `}
                  >
                    <div className="flex items-center gap-3">
                      {option.id === null ? (
                        <Users className="h-4 w-4 text-green-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500">
                          {option.role === 'all'
                            ? 'Tổng hợp tất cả'
                            : option.role === 'employee'
                              ? 'Nhân viên'
                              : option.role === 'team_leader'
                                ? 'Trưởng nhóm'
                                : option.role === 'retail_director'
                                  ? 'Trưởng phòng'
                                  : option.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">{option.count}</span>
                      {selectedMemberId === option.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                );
              })}

              {teamMembers.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không có thành viên nào trong nhóm</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default MemberTaskSelector;
