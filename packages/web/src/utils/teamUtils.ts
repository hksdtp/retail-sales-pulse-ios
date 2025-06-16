import { Team, User } from '@/types/user';

/**
 * Lấy tên team kèm tên trưởng nhóm
 * @param teamId ID của team
 * @param teams Danh sách teams
 * @param users Danh sách users
 * @returns Tên team kèm tên trưởng nhóm
 */
export const getTeamNameWithLeader = (
  teamId: string,
  teams: Team[],
  users: User[]
): string => {
  if (!teamId || teamId === '0') {
    return 'Chưa có nhóm';
  }

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return `Nhóm ${teamId}`;
  }

  // Tìm trưởng nhóm theo team name pattern và location
  const teamLeader = findTeamLeaderByPattern(team, users);

  if (teamLeader) {
    return `${team.name} - ${teamLeader.name}`;
  }

  return team.name;
};

/**
 * Tìm trưởng nhóm dựa trên pattern của team name và location
 */
const findTeamLeaderByPattern = (team: Team, users: User[]): User | null => {
  // Mapping chính xác theo yêu cầu của user (5 teams - đã xóa NHÓM 4)
  const teamLeaderMapping = {
    hanoi: {
      'NHÓM 1': 'Lương Việt Anh',      // team_id: 1
      'NHÓM 2': 'Nguyễn Thị Thảo',     // team_id: 2
      'NHÓM 3': 'Trịnh Thị Bốn',       // team_id: 3
      'NHÓM 5': 'Phạm Thị Hương',      // team_id: 5 (chuyển từ NHÓM 4 sang NHÓM 5)
    },
    hcm: {
      'NHÓM 1': 'Nguyễn Thị Nga',      // team_id: 6 -> NHÓM 1 HCM
      'NHÓM 2': 'Nguyễn Ngọc Việt Khanh', // team_id: 7 -> NHÓM 2 HCM
    }
  };

  const location = team.location === 'hcm' ? 'hcm' : 'hanoi';
  const locationMapping = teamLeaderMapping[location];

  // Tìm pattern phù hợp
  for (const [pattern, leaderName] of Object.entries(locationMapping)) {
    if (team.name.includes(pattern)) {
      // Tìm leader theo tên
      const leader = users.find(user =>
        user.name === leaderName && user.role === 'team_leader'
      );

      if (leader) {
        return leader;
      }

      // Fallback: tìm theo tên gần đúng
      const partialMatch = users.find(user =>
        user.role === 'team_leader' &&
        leaderName.split(' ').some(part => user.name.includes(part))
      );

      if (partialMatch) {
        return partialMatch;
      }
    }
  }

  // Xử lý trường hợp đặc biệt: Phạm Thị Hương (NHÓM 5)
  // Phạm Thị Hương có team_id: 5, chuyển từ NHÓM 4 (Lê Tiến Quân đã nghỉ việc)
  if (team.location === 'hanoi' && team.name.includes('NHÓM 5')) {
    const huong = users.find(user =>
      user.name.includes('Phạm Thị Hương') &&
      user.role === 'team_leader' &&
      user.team_id === '5'
    );
    if (huong) {
      return huong;
    }
  }

  // Fallback: tìm theo leader_id nếu có
  if (team.leader_id) {
    const leader = users.find(user => user.id === team.leader_id);
    if (leader) {
      return leader;
    }
  }

  return null;
};

/**
 * Lấy tên team ngắn gọn (chỉ tên team)
 * @param teamId ID của team
 * @param teams Danh sách teams
 * @returns Tên team
 */
export const getTeamName = (teamId: string, teams: Team[]): string => {
  if (!teamId || teamId === '0') {
    return 'Chưa có nhóm';
  }

  const team = teams.find((t) => t.id === teamId);
  return team ? team.name : `Nhóm ${teamId}`;
};

/**
 * Lấy thông tin trưởng nhóm
 * @param teamId ID của team
 * @param teams Danh sách teams
 * @param users Danh sách users
 * @returns Thông tin trưởng nhóm
 */
export const getTeamLeader = (
  teamId: string,
  teams: Team[],
  users: User[]
): User | null => {
  if (!teamId || teamId === '0') {
    return null;
  }

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return null;
  }

  // Sử dụng helper function để tìm team leader
  return findTeamLeaderByPattern(team, users);
};

/**
 * Lấy danh sách teams với tên trưởng nhóm cho dropdown
 * @param teams Danh sách teams
 * @param users Danh sách users
 * @returns Danh sách teams với tên kèm trưởng nhóm
 */
export const getTeamsWithLeaderNames = (
  teams: Team[],
  users: User[]
): Array<{ id: string; name: string; displayName: string; leader?: User }> => {
  // Lọc ra teams unique (loại bỏ duplicate)
  const uniqueTeams = getUniqueTeams(teams);

  return uniqueTeams.map((team) => {
    const leader = getTeamLeader(team.id, teams, users);
    const displayName = leader ? `${team.name} - ${leader.name}` : team.name;

    return {
      id: team.id,
      name: team.name,
      displayName,
      leader: leader || undefined,
    };
  });
};

/**
 * Lọc ra teams unique theo cấu trúc mong muốn
 * HN: NHÓM 1,2,3,4,5 - HCM: NHÓM 1,2
 */
const getUniqueTeams = (teams: Team[]): Team[] => {
  const result: Team[] = [];

  // Helper function để normalize location
  const normalizeLocation = (loc: string) => {
    if (!loc) return '';
    const lower = loc.toLowerCase();
    if (lower === 'hanoi' || lower === 'hà nội') return 'hanoi';
    if (lower === 'hcm' || lower === 'hồ chí minh') return 'hcm';
    return lower;
  };

  // Cấu trúc mong muốn (5 teams - đã xóa NHÓM 4)
  const desiredStructure = {
    hanoi: ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 5'],
    hcm: ['NHÓM 1', 'NHÓM 2']
  };

  // Lọc teams theo cấu trúc mong muốn
  Object.entries(desiredStructure).forEach(([location, teamNames]) => {
    teamNames.forEach(teamName => {
      // Tìm team phù hợp, ưu tiên team có tên cụ thể
      let team = teams.find(t => {
        const locationMatch = normalizeLocation(t.location) === normalizeLocation(location);
        const nameMatch = t.name === teamName;
        const activeMatch = t.active !== false;
        return locationMatch && nameMatch && activeMatch;
      });

      // Nếu không tìm thấy, tìm team có chứa tên
      if (!team) {
        team = teams.find(t => {
          const locationMatch = normalizeLocation(t.location) === normalizeLocation(location);
          const nameMatch = t.name.includes(teamName);
          const activeMatch = t.active !== false;
          return locationMatch && nameMatch && activeMatch;
        });
      }

      if (team) {
        result.push(team);
      }
    });
  });

  return result;
};

/**
 * Sắp xếp teams theo location và tên
 * @param teams Danh sách teams
 * @param users Danh sách users
 * @returns Teams đã sắp xếp
 */
export const sortTeamsWithLeaders = (
  teams: Team[],
  users: User[]
): Array<{ id: string; name: string; displayName: string; leader?: User; location: string }> => {
  const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
  
  return teamsWithLeaders
    .map((team) => {
      const originalTeam = teams.find((t) => t.id === team.id);
      return {
        ...team,
        location: originalTeam?.location || 'unknown',
      };
    })
    .sort((a, b) => {
      // Sắp xếp theo location trước
      if (a.location !== b.location) {
        if (a.location === 'hanoi') return -1;
        if (b.location === 'hanoi') return 1;
        if (a.location === 'hcm') return -1;
        if (b.location === 'hcm') return 1;
      }
      
      // Sau đó sắp xếp theo tên team
      return a.name.localeCompare(b.name, 'vi');
    });
};
