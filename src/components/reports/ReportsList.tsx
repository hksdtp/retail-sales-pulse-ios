
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, PieChart, FileText, Users, ChartBar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'location' | 'partner';
  lastGenerated: string;
  format: 'PDF' | 'Excel';
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Báo cáo tổng quan hàng ngày',
    description: 'Tóm tắt các hoạt động kinh doanh và KPI chính trong ngày',
    type: 'daily',
    lastGenerated: '05/05/2025',
    format: 'PDF',
  },
  {
    id: '2',
    title: 'Báo cáo hiệu suất cá nhân',
    description: 'Đánh giá chi tiết hiệu suất của từng nhân viên trong tuần',
    type: 'weekly',
    lastGenerated: '04/05/2025',
    format: 'Excel',
  },
  {
    id: '3',
    title: 'Báo cáo hiệu suất nhóm',
    description: 'So sánh hiệu suất giữa các nhóm và KPI đạt được',
    type: 'monthly',
    lastGenerated: '01/05/2025',
    format: 'Excel',
  },
  {
    id: '4',
    title: 'Báo cáo phân tích xu hướng',
    description: 'Phân tích xu hướng doanh số và hoạt động theo thời gian',
    type: 'quarterly',
    lastGenerated: '01/04/2025',
    format: 'PDF',
  },
  {
    id: '5',
    title: 'Báo cáo so sánh địa điểm',
    description: 'So sánh hiệu suất giữa các văn phòng Hà Nội và Hồ Chí Minh',
    type: 'location',
    lastGenerated: '01/05/2025',
    format: 'Excel',
  },
  {
    id: '6',
    title: 'Báo cáo phân tích đối tác/KTS',
    description: 'Phân tích chi tiết về hiệu suất làm việc với đối tác và KTS',
    type: 'partner',
    lastGenerated: '01/05/2025',
    format: 'Excel',
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'daily': return <Calendar className="w-5 h-5" />;
    case 'weekly': return <FileText className="w-5 h-5" />;
    case 'monthly': return <ChartBar className="w-5 h-5" />;
    case 'quarterly': return <PieChart className="w-5 h-5" />;
    case 'location': return <ChartBar className="w-5 h-5" />;
    case 'partner': return <Users className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

const ReportsList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reports.map(report => (
        <Card key={report.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-ios-blue/10 flex items-center justify-center mr-4">
                {getTypeIcon(report.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-lg">{report.title}</h3>
                  <Badge variant="outline">{report.format}</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{report.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">Lần cuối: {report.lastGenerated}</span>
                  <Button size="sm">Tải xuống</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportsList;
