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

  // Tính toán dữ liệu thực từ báo cáo
  const realData = {
    // Dữ liệu tuần: Không có trong báo cáo, sử dụng 0
    weekly: [
      { name: 'T2', revenue: 0, target: 0 },
      { name: 'T3', revenue: 0, target: 0 },
      { name: 'T4', revenue: 0, target: 0 },
      { name: 'T5', revenue: 0, target: 0 },
      { name: 'T6', revenue: 0, target: 0 },
      { name: 'T7', revenue: 0, target: 0 },
      { name: 'CN', revenue: 0, target: 0 },
    ],
    // Dữ liệu tháng từ báo cáo thực tế
    monthly: metrics.monthlyTrend,
    // Dữ liệu quý từ báo cáo thực tế năm 2025
    quarterly: [
      { name: 'Q1 2025', revenue: 3230000000, target: 7500000000 }, // T1+T2+T3: 1.3+0.43+1.5 tỷ
      { name: 'Q2 2025', revenue: 7080000000, target: 13160000000 }, // T4+T5+T6: 1.33+1.45+4.3 tỷ
      { name: 'Q3 2025', revenue: 0, target: 15420000000 }, // Chưa có dữ liệu
      { name: 'Q4 2025', revenue: 0, target: 18420000000 }, // Chưa có dữ liệu
    ],
  };

  return realData;
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
