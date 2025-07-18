import { useCallback, useEffect, useState } from 'react';

import { getApiUrl } from '@/config/api';

import { Task } from '../components/tasks/types/TaskTypes';
import { useAuth } from '../context/AuthContext';
// import { TaskFirebaseManager } from '../services/TaskFirebaseManager';
// import { FirebaseService } from '../services/FirebaseService';

export type TaskViewLevel = 'department' | 'team' | 'individual' | 'personal' | 'shared';

interface ManagerTaskData {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  taskCounts: {
    department: number;
    team: number;
    individual: number;
    personal: number;
    shared: number;
  };
  memberTaskCounts: { [memberId: string]: number };
  refreshTasks: () => Promise<void>;
}

export const useManagerTaskData = (
  viewLevel: TaskViewLevel,
  selectedMemberId?: string | null,
): ManagerTaskData => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskCounts, setTaskCounts] = useState({
    department: 0,
    team: 0,
    individual: 0,
    personal: 0,
    shared: 0,
  });
  const [memberTaskCounts, setMemberTaskCounts] = useState<{ [memberId: string]: number }>({});

  const { currentUser, users, teams } = useAuth();

  const fetchTasksByLevel = useCallback(
    async (level: TaskViewLevel) => {
      if (!currentUser) return [];

      // TODO: Firebase integration (temporarily disabled due to import issues)
      // Will be re-enabled after fixing Vite import resolution
      console.log(`🔥 Firebase integration temporarily disabled for ${level} tasks`);
      console.log(`📡 Using API fallback for ${level} tasks`);

      // Fallback to API if Firebase fails or no data
      try {
        const apiUrl = getApiUrl();
        const params = new URLSearchParams();

        // Base parameters
        params.append('user_id', currentUser.id);
        params.append('role', currentUser.role);
        params.append('view_level', level);

        // Team leader chỉ có thể xem team của mình
        if (currentUser.team_id) {
          params.append('team_id', currentUser.team_id);
        }

        if (currentUser.department_type) {
          params.append('department', currentUser.department_type);
        }

        // Thêm selectedMemberId nếu có (cho individual view)
        if (level === 'individual' && selectedMemberId) {
          params.append('member_id', selectedMemberId);
          console.log(`👤 Adding member_id to API request: ${selectedMemberId}`);
        }

        console.log(
          `🔒 Security: ${currentUser.role} ${currentUser.name} requesting ${level} view for team ${currentUser.team_id}`,
        );
        if (level === 'individual' && selectedMemberId) {
          console.log(`👤 Specific member requested: ${selectedMemberId}`);
        }

        const url = `${apiUrl}/tasks/manager-view?${params.toString()}`;

        console.log(`📡 API Request: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log(`📄 Raw response text:`, responseText);

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`❌ JSON Parse Error:`, parseError);
          console.error(`📄 Response text that failed to parse:`, responseText);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }

        console.log(`📊 API Response for ${level}:`, result);

        if (result.success && result.data) {
          
          return result.data;
        } else {
          console.error(`❌ Error loading ${level} tasks:`, result.error);
          return [];
        }
      } catch (error) {
        console.error(`❌ Network error loading ${level} tasks:`, error);
        return [];
      }
    },
    [currentUser, selectedMemberId],
  );

  const loadTasks = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `🔄 Loading tasks for view level: ${viewLevel}, member: ${selectedMemberId || 'all'}`,
      );

      let tasksData = await fetchTasksByLevel(viewLevel);

      // Load auto-synced tasks từ localStorage và merge
      if (viewLevel === 'personal' || viewLevel === 'individual') {
        
        try {
          const taskKey = `user_tasks_${currentUser.id}`;
          const storedTasks = localStorage.getItem(taskKey);
          const autoSyncedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

          if (autoSyncedTasks.length > 0) {
            console.log(`🔄 Merging ${autoSyncedTasks.length} auto-synced tasks with ${tasksData.length} API tasks`);

            // Merge auto-synced tasks, tránh duplicate
            autoSyncedTasks.forEach(autoTask => {
              const isDuplicate = tasksData.some(apiTask =>
                apiTask.title === autoTask.title && apiTask.date === autoTask.date
              );

              if (!isDuplicate) {
                tasksData.push(autoTask);
                
              } else {
                console.log(`⏭️ Skipped duplicate task: ${autoTask.title}`);
              }
            });

            console.log(`📊 Final task count after merge: ${tasksData.length}`);
          }
        } catch (error) {
          console.error('❌ Error loading auto-synced tasks:', error);
        }
      }

      // Nếu là individual view và có chọn member cụ thể
      if (viewLevel === 'individual' && selectedMemberId) {
        console.log(`👤 Individual view for member ${selectedMemberId}: ${tasksData.length} tasks before filtering`);

        // Đảm bảo filter đúng tasks của member được chọn
        // API có thể chưa filter đúng, nên filter thêm ở frontend
        const memberTasks = tasksData.filter((task) => {
          const isAssignedToMember = task.assignedTo === selectedMemberId;
          const isCreatedByMember = task.user_id === selectedMemberId;
          const shouldInclude = isAssignedToMember || isCreatedByMember;

          return shouldInclude;
        });

        console.log(`👤 After filtering for member ${selectedMemberId}: ${memberTasks.length} tasks`);
        tasksData = memberTasks;
      } else if (viewLevel === 'individual') {
        console.log(`👥 Individual view for all team members: ${tasksData.length} tasks`);
      }

      setTasks(tasksData);

      // Load counts for all levels (for the selector)
      const isDirector =
        currentUser.role === 'retail_director' || currentUser.role === 'project_director';
      const isTeamLeader = currentUser.role === 'team_leader';

      if (isDirector || isTeamLeader) {
        const [personalTasks, teamTasks, departmentTasks, individualTasks, sharedTasks] =
          await Promise.all([
            fetchTasksByLevel('personal'),
            fetchTasksByLevel('team'),
            isDirector ? fetchTasksByLevel('department') : Promise.resolve([]),
            fetchTasksByLevel('individual'),
            fetchTasksByLevel('shared'),
          ]);

        setTaskCounts({
          personal: personalTasks.length,
          team: teamTasks.length,
          department: departmentTasks.length,
          individual: individualTasks.length,
          shared: sharedTasks.length,
        });

        // Tính task counts cho từng member (cho individual view)
        if (isTeamLeader || isDirector) {
          let teamMembers;

          if (isDirector) {
            // Directors: lấy tất cả members trong department
            teamMembers = users.filter((user) =>
              user.department_type === currentUser.department_type &&
              user.id !== currentUser.id
            );
          } else {
            // Team Leaders: chỉ lấy members trong team
            teamMembers = users.filter((user) => user.team_id === currentUser.team_id);
          }

          const memberCounts: { [memberId: string]: number } = {};

          console.log(
            `👥 Team members for counting (${isDirector ? 'Director - All Department' : 'Team Leader - Team Only'}):`,
            teamMembers.map((m) => `${m.name} (${m.id}) - team: ${m.team_id}`),
          );

          for (const member of teamMembers) {
            const memberTasks = individualTasks.filter((task) => task.assignedTo === member.id);
            memberCounts[member.id] = memberTasks.length;
            console.log(`📊 Member ${member.name} (${member.id}): ${memberTasks.length} tasks`);
          }

          console.log(`📈 Final member counts:`, memberCounts);
          setMemberTaskCounts(memberCounts);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading manager tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, viewLevel, fetchTasksByLevel]);

  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, selectedMemberId]);

  return {
    tasks,
    isLoading,
    error,
    taskCounts,
    memberTaskCounts,
    refreshTasks,
  };
};
