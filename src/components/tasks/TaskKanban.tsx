
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  date: string;
  isNew: boolean;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const columns: Column[] = [
  {
    id: 'todo',
    title: 'Chưa bắt đầu',
    tasks: [
      {
        id: '1',
        title: 'Gặp đối tác ABC',
        description: 'Thảo luận về hợp tác mới',
        type: 'partner',
        date: '10/05/2025',
        isNew: true
      },
      {
        id: '2',
        title: 'Báo giá dự án X',
        description: 'Chuẩn bị báo giá cho khách hàng',
        type: 'quote',
        date: '12/05/2025',
        isNew: true
      },
    ]
  },
  {
    id: 'in-progress',
    title: 'Đang thực hiện',
    tasks: [
      {
        id: '3',
        title: 'Khảo sát công trình Y',
        description: 'Đo đạc và đánh giá hiện trạng',
        type: 'client',
        date: '08/05/2025',
        isNew: false
      },
      {
        id: '4',
        title: 'Làm việc với KTS Nguyễn',
        description: 'Trao đổi về thiết kế mới',
        type: 'architect',
        date: '09/05/2025',
        isNew: true
      },
    ]
  },
  {
    id: 'on-hold',
    title: 'Đang chờ',
    tasks: [
      {
        id: '5',
        title: 'Phản hồi báo giá',
        description: 'Chờ khách hàng phản hồi',
        type: 'quote',
        date: '05/05/2025',
        isNew: false
      },
    ]
  },
  {
    id: 'completed',
    title: 'Hoàn thành',
    tasks: [
      {
        id: '6',
        title: 'Ký hợp đồng với Z',
        description: 'Hoàn tất thủ tục ký kết',
        type: 'client',
        date: '01/05/2025',
        isNew: false
      },
    ]
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'partner': return 'bg-ios-blue text-white';
    case 'architect': return 'bg-ios-green text-white';
    case 'client': return 'bg-ios-orange text-white';
    case 'quote': return 'bg-ios-yellow text-black';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'partner': return 'Đối tác';
    case 'architect': return 'KTS';
    case 'client': return 'Khách hàng';
    case 'quote': return 'Báo giá';
    default: return type;
  }
};

const TaskKanban = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => (
        <div key={column.id} className="flex flex-col">
          <div className="bg-muted px-4 py-2 mb-2 rounded-md font-medium flex justify-between items-center">
            <span>{column.title}</span>
            <Badge variant="outline">{column.tasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map(task => (
              <Card key={task.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    {task.isNew && (
                      <Badge variant="default" className="bg-ios-red text-white">Mới</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={`${getTypeColor(task.type)}`}>
                      {getTypeName(task.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskKanban;
