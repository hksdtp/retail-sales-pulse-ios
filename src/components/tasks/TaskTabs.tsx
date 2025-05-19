
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskKanban from './TaskKanban';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';
import { KanbanSquare, ListTodo, Calendar } from 'lucide-react';

const TaskTabs = () => {
  // Sử dụng List làm màn hình chính mặc định - đổi từ kanban sang list
  const [view, setView] = useState('list');
  
  // Các giá trị mặc định cho bộ lọc
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  return (
    <div className="space-y-4">
      {/* Khu vực này sẽ chứa menu và bộ lọc mới */}
  
    </div>
  );
};

export default TaskTabs;
