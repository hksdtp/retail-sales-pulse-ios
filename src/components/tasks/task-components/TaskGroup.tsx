
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TaskItem from './TaskItem';
import { Task } from '../types/TaskTypes';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  getTeamName: (teamId: string) => string;
  getAssigneeName: (userId: string) => string;
}

const TaskGroup = ({ title, tasks, getTeamName, getAssigneeName }: TaskGroupProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg">{title}</h3>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Công việc</TableHead>
              <TableHead className="w-[15%]">Loại</TableHead>
              <TableHead className="w-[15%]">Khu vực</TableHead>
              <TableHead className="w-[15%]">Nhóm</TableHead>
              <TableHead className="w-[15%]">Người thực hiện</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                getTeamName={getTeamName} 
                getAssigneeName={getAssigneeName} 
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TaskGroup;
