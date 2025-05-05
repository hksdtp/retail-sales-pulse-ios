
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  team: string;
  location: 'Hà Nội' | 'Hồ Chí Minh';
  joinDate: string;
  status: 'active' | 'vacation' | 'sick';
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Vân',
    position: 'Nhóm trưởng',
    team: 'Nhóm 1',
    location: 'Hà Nội',
    joinDate: '01/06/2022',
    status: 'active',
  },
  {
    id: '2',
    name: 'Trần Đình Hùng',
    position: 'Nhân viên kinh doanh',
    team: 'Nhóm 1',
    location: 'Hà Nội',
    joinDate: '15/08/2022',
    status: 'active',
  },
  {
    id: '3',
    name: 'Lê Thị Mai',
    position: 'Nhân viên kinh doanh',
    team: 'Nhóm 1',
    location: 'Hà Nội',
    joinDate: '10/10/2022',
    status: 'vacation',
  },
  {
    id: '4',
    name: 'Phạm Văn Nam',
    position: 'Nhóm trưởng',
    team: 'Nhóm 2',
    location: 'Hà Nội',
    joinDate: '05/05/2022',
    status: 'active',
  },
  {
    id: '5',
    name: 'Đỗ Thị Hà',
    position: 'Nhân viên kinh doanh',
    team: 'Nhóm 2',
    location: 'Hà Nội',
    joinDate: '20/07/2022',
    status: 'sick',
  },
  {
    id: '6',
    name: 'Vũ Hoàng Anh',
    position: 'Nhóm trưởng',
    team: 'Nhóm 3',
    location: 'Hồ Chí Minh',
    joinDate: '01/04/2022',
    status: 'active',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge className="bg-ios-green text-white">Đang làm việc</Badge>;
    case 'vacation': return <Badge className="bg-ios-blue text-white">Nghỉ phép</Badge>;
    case 'sick': return <Badge className="bg-ios-yellow text-black">Nghỉ ốm</Badge>;
    default: return null;
  }
};

const Employees = () => {
  return (
    <AppLayout>
      <PageHeader 
        title="Nhân viên" 
        subtitle="Quản lý thông tin nhân viên phòng kinh doanh"
        actions={
          <Button>Thêm nhân viên</Button>
        }
      />
      
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(employee => (
            <Card key={employee.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-ios-blue rounded-full flex items-center justify-center text-white mr-4">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{employee.name}</h3>
                      {getStatusBadge(employee.status)}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{employee.position}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nhóm:</span>
                        <span>{employee.team}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Văn phòng:</span>
                        <span>{employee.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ngày vào làm:</span>
                        <span>{employee.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Employees;
