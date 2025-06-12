import { sortTasks } from '../TaskFilters';
import { Task } from '../../types/TaskTypes';

describe('TaskFilters - sortTasks', () => {
  const createMockTask = (
    id: string,
    title: string,
    priority: 'urgent' | 'high' | 'normal' | 'low' = 'normal',
    created_at: string,
    updated_at?: string
  ): Task => ({
    id,
    title,
    description: `Description for ${title}`,
    type: 'other',
    date: created_at,
    status: 'todo',
    priority,
    progress: 0,
    isNew: false,
    location: 'hanoi',
    teamId: 'team1',
    assignedTo: 'user1',
    user_id: 'user1',
    created_at,
    updated_at,
  });

  it('should sort tasks by time (newest first)', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Old Task', 'normal', '2025-01-01T10:00:00Z'),
      createMockTask('2', 'New Task', 'normal', '2025-01-02T10:00:00Z'),
      createMockTask('3', 'Middle Task', 'normal', '2025-01-01T15:00:00Z'),
    ];

    const sorted = sortTasks(tasks);

    expect(sorted[0].id).toBe('2'); // Newest first
    expect(sorted[1].id).toBe('3'); // Middle
    expect(sorted[2].id).toBe('1'); // Oldest last
  });

  it('should prioritize by priority when times are close (within 1 minute)', () => {
    const baseTime = '2025-01-01T10:00:00Z';
    const closeTime = '2025-01-01T10:00:30Z'; // 30 seconds later

    const tasks: Task[] = [
      createMockTask('1', 'Low Priority', 'low', baseTime),
      createMockTask('2', 'Urgent Priority', 'urgent', closeTime),
      createMockTask('3', 'High Priority', 'high', baseTime),
      createMockTask('4', 'Normal Priority', 'normal', closeTime),
    ];

    const sorted = sortTasks(tasks);

    // Should be sorted by priority: urgent > high > normal > low
    expect(sorted[0].priority).toBe('urgent');
    expect(sorted[1].priority).toBe('high');
    expect(sorted[2].priority).toBe('normal');
    expect(sorted[3].priority).toBe('low');
  });

  it('should use updated_at when available', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Old Created, Recently Updated', 'normal', '2025-01-01T10:00:00Z', '2025-01-02T15:00:00Z'),
      createMockTask('2', 'Recently Created', 'normal', '2025-01-02T10:00:00Z'),
    ];

    const sorted = sortTasks(tasks);

    // Task 1 should be first because it was updated more recently
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('should handle mixed priority and time scenarios correctly', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Old Urgent', 'urgent', '2025-01-01T10:00:00Z'),
      createMockTask('2', 'New Low', 'low', '2025-01-02T10:00:00Z'),
      createMockTask('3', 'New High', 'high', '2025-01-02T10:00:30Z'), // 30 seconds after task 2
    ];

    const sorted = sortTasks(tasks);

    // Task 3 and 2 are close in time, so priority matters: high > low
    // But task 1 is much older, so it should be last despite being urgent
    expect(sorted[0].priority).toBe('high'); // Task 3
    expect(sorted[1].priority).toBe('low');  // Task 2
    expect(sorted[2].priority).toBe('urgent'); // Task 1 (oldest)
  });

  it('should handle tasks without priority (default to normal)', () => {
    const tasks: Task[] = [
      createMockTask('1', 'No Priority', undefined, '2025-01-01T10:00:00Z'),
      createMockTask('2', 'High Priority', 'high', '2025-01-01T10:00:30Z'),
    ];

    const sorted = sortTasks(tasks);

    // High priority should come first when times are close
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBeUndefined();
  });

  it('should handle empty array', () => {
    const tasks: Task[] = [];
    const sorted = sortTasks(tasks);
    expect(sorted).toEqual([]);
  });

  it('should handle single task', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Single Task', 'normal', '2025-01-01T10:00:00Z'),
    ];
    const sorted = sortTasks(tasks);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('1');
  });
});
