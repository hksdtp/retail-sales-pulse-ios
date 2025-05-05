
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TaskKanban from './TaskKanban';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';

const TaskTabs = () => {
  const [view, setView] = useState('kanban');

  return (
    <Tabs value={view} onValueChange={setView} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="kanban" className="mt-0">
        <TaskKanban />
      </TabsContent>
      
      <TabsContent value="list" className="mt-0">
        <TaskList />
      </TabsContent>
      
      <TabsContent value="calendar" className="mt-0">
        <TaskCalendar />
      </TabsContent>
    </Tabs>
  );
};

export default TaskTabs;
