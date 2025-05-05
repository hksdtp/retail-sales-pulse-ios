
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  date: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  progress: number;
  isNew: boolean;
}

const groupedTasks = {
  'Hôm nay (05/05/2025)': [
    {
      id: '1',
      title: 'Gặp đối tác ABC',
      description: 'Thảo luận về hợp tác mới',
      type: 'partner',
      date: '10:30',
      status: 'todo',
      progress: 0,
      isNew: true
    },
    {
      id: '3',
      title: 'Khảo sát công trình Y',
      description: 'Đo đạc và đánh giá hiện trạng',
      type: 'client',
      date: '14:00',
      status: 'in-progress',
      progress: 60,
      isNew: false
    },
  ],
  'Ngày mai (06/05/2025)': [
    {
      id: '4',
      title: 'Làm việc với KTS Nguyễn',
      description: 'Trao đổi về thiết kế mới',
      type: 'architect',
      date: '09:00',
      status: 'in-progress',
      progress: 30,
      isNew: true
    },
  ],
  'Sắp tới': [
    {
      id: '2',
      title: 'Báo giá dự án X',
      description: 'Chuẩn bị báo giá cho khách hàng',
      type: 'quote',
      date: '12/05/2025',
      status: 'todo',
      progress: 0,
      isNew: true
    },
    {
      id: '5',
      title: 'Phản hồi báo giá',
      description: 'Chờ khách hàng phản hồi',
      type: 'quote',
      date: '07/05/2025',
      status: 'on-hold',
      progress: 80,
      isNew: false
    },
  ],
  'Hoàn thành gần đây': [
    {
      id: '6',
      title: 'Ký hợp đồng với Z',
      description: 'Hoàn tất thủ tục ký kết',
      type: 'client',
      date: '01/05/2025',
      status: 'completed',
      progress: 100,
      isNew: false
    },
  ]
};

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-ios-green';
    case 'in-progress': return 'bg-ios-blue';
    case 'on-hold': return 'bg-ios-yellow';
    case 'todo': return 'bg-gray-300';
    default: return 'bg-gray-200';
  }
};

const TaskList = () => {
  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([group, tasks]) => (
        <div key={group} className="space-y-3">
          <h3 className="font-medium text-lg">{group}</h3>
          {tasks.map(task => (
            <Card key={task.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${task.status === 'completed' ? 'bg-ios-green' : 'border border-gray-300'}`}>
                        {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="ml-8 mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <Badge className={`${getTypeColor(task.type)} mr-2`}>
                            {getTypeName(task.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.date}</span>
                        </div>
                        {task.isNew && (
                          <Badge variant="default" className="bg-ios-red text-white">Mới</Badge>
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className={`h-1.5 rounded-full ${getStatusColor(task.status)}`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
