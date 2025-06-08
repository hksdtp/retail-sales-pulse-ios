import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { reportsDataService } from '@/services/ReportsDataService';

const getRevenueData = () => {
  const metrics = reportsDataService.getDashboardMetrics();

  return {
    weekly: [
      { name: 'T2', revenue: 2400000000, target: 2800000000 },
      { name: 'T3', revenue: 1398000000, target: 2200000000 },
      { name: 'T4', revenue: 9800000000, target: 7000000000 },
      { name: 'T5', revenue: 3908000000, target: 4000000000 },
      { name: 'T6', revenue: 4800000000, target: 4200000000 },
      { name: 'T7', revenue: 3800000000, target: 3500000000 },
      { name: 'CN', revenue: 4300000000, target: 4100000000 },
    ],
    monthly: metrics.monthlyTrend,
    quarterly: [
      { name: 'Q1', revenue: 72300000000, target: 70000000000 },
      { name: 'Q2', revenue: 74800000000, target: 74000000000 },
      { name: 'Q3', revenue: 81200000000, target: 78000000000 },
      { name: 'Q4', revenue: 82900000000, target: 85000000000 },
    ],
  };
};

type PeriodType = 'weekly' | 'monthly' | 'quarterly';

const RevenueChart = () => {
  const [period, setPeriod] = useState<PeriodType>('monthly');

  const data = getRevenueData()[period];

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
            <ToggleGroupItem value="weekly" className="text-xs px-3">
              Tuần
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="text-xs px-3">
              Tháng
            </ToggleGroupItem>
            <ToggleGroupItem value="quarterly" className="text-xs px-3">
              Quý
            </ToggleGroupItem>
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
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                formatter={(value) => [`${value.toLocaleString('vi-VN')} đ`, undefined]}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#0A84FF" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="target"
                name="Mục tiêu"
                stroke="#FF9500"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
