
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Performer {
  id: number;
  name: string;
  role: string;
  avatar: string;
  sales: number;
  deals: number;
  completion: number;
}

const topPerformers: Performer[] = [
  {
    id: 1,
    name: 'Nguyễn Minh Vân',
    role: 'Nhóm trưởng',
    avatar: 'V',
    sales: 384500000,
    deals: 23,
    completion: 145,
  },
  {
    id: 2,
    name: 'Trần Đình Hùng',
    role: 'Nhân viên',
    avatar: 'H',
    sales: 356700000,
    deals: 19,
    completion: 131,
  },
  {
    id: 3,
    name: 'Lê Thị Mai',
    role: 'Nhân viên',
    avatar: 'M',
    sales: 312300000,
    deals: 17,
    completion: 120,
  },
];

const TopPerformers = () => {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Nhân viên xuất sắc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((performer) => (
            <div key={performer.id} className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-ios-blue flex items-center justify-center text-white font-medium">
                {performer.avatar}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(performer.sales / 1000000).toFixed(1)}tr</p>
                    <p className="text-sm text-muted-foreground">{performer.deals} đơn</p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ios-blue rounded-full" 
                    style={{ width: `${Math.min(performer.completion, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">{performer.completion}% mục tiêu</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
