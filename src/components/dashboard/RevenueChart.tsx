
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Line, ComposedChart } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const dummyData = {
  weekly: [
    { name: 'T2', revenue: 2400, target: 2800 },
    { name: 'T3', revenue: 1398, target: 2200 },
    { name: 'T4', revenue: 9800, target: 7000 },
    { name: 'T5', revenue: 3908, target: 4000 },
    { name: 'T6', revenue: 4800, target: 4200 },
    { name: 'T7', revenue: 3800, target: 3500 },
    { name: 'CN', revenue: 4300, target: 4100 },
  ],
  monthly: [
    { name: 'Tháng 1', revenue: 21400, target: 22000 },
    { name: 'Tháng 2', revenue: 24500, target: 24000 },
    { name: 'Tháng 3', revenue: 26400, target: 25000 },
    { name: 'Tháng 4', revenue: 22400, target: 24000 },
    { name: 'Tháng 5', revenue: 28300, target: 26000 },
  ],
  quarterly: [
    { name: 'Q1', revenue: 72300, target: 70000 },
    { name: 'Q2', revenue: 74800, target: 74000 },
    { name: 'Q3', revenue: 81200, target: 78000 },
    { name: 'Q4', revenue: 82900, target: 85000 },
  ]
};

type PeriodType = 'weekly' | 'monthly' | 'quarterly';

const RevenueChart = () => {
  const [period, setPeriod] = useState<PeriodType>('weekly');
  
  const data = dummyData[period];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-lg font-semibold">Doanh thu</CardTitle>
          <ToggleGroup 
            type="single" 
            value={period}
            onValueChange={(value) => value && setPeriod(value as PeriodType)} 
            className="mt-2 sm:mt-0"
          >
            <ToggleGroupItem value="weekly" className="text-xs px-3">Tuần</ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="text-xs px-3">Tháng</ToggleGroupItem>
            <ToggleGroupItem value="quarterly" className="text-xs px-3">Quý</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                formatter={(value) => [`${value.toLocaleString('vi-VN')} đ`, undefined]}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#0A84FF" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="target" name="Mục tiêu" stroke="#FF9500" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
