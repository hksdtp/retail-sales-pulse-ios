import React, { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import KpiProgressCard from './KpiProgressCard';

const categories = [
  { id: 'personal', name: 'Cá nhân' },
  { id: 'team', name: 'Nhóm' },
  { id: 'department', name: 'Phòng ban' },
];

const timeFrames = [
  { id: 'weekly', name: 'Tuần này' },
  { id: 'monthly', name: 'Tháng này' },
  { id: 'quarterly', name: 'Quý này' },
  { id: 'yearly', name: 'Năm nay' },
];

interface KpiItem {
  id: string;
  name: string;
  value: number;
  target: number;
  category: string;
  trend: 'up' | 'down' | 'flat';
  unit?: string;
}

// Sample KPI data with properly typed fields
const kpiData: Record<string, Record<string, KpiItem[]>> = {
  personal: {
    weekly: [
      { id: '1', name: 'Số đối tác mới', value: 3, target: 5, category: 'partner', trend: 'up' },
      { id: '2', name: 'Số KTS mới', value: 2, target: 3, category: 'architect', trend: 'flat' },
      { id: '3', name: 'Số KH/CĐT mới', value: 4, target: 4, category: 'client', trend: 'up' },
      { id: '4', name: 'Số báo giá mới', value: 7, target: 10, category: 'quote', trend: 'down' },
    ],
    monthly: [
      { id: '5', name: 'Số đối tác mới', value: 12, target: 20, category: 'partner', trend: 'up' },
      { id: '6', name: 'Số KTS mới', value: 8, target: 12, category: 'architect', trend: 'up' },
      { id: '7', name: 'Số KH/CĐT mới', value: 15, target: 16, category: 'client', trend: 'flat' },
      { id: '8', name: 'Số báo giá mới', value: 28, target: 40, category: 'quote', trend: 'down' },
      {
        id: '9',
        name: 'Tỷ lệ chốt SBG',
        value: 30,
        target: 40,
        category: 'quote',
        trend: 'down',
        unit: '%',
      },
      {
        id: '10',
        name: 'Doanh số',
        value: 120000000,
        target: 150000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    quarterly: [
      { id: '11', name: 'Số đối tác mới', value: 32, target: 60, category: 'partner', trend: 'up' },
      { id: '12', name: 'Số KTS mới', value: 20, target: 30, category: 'architect', trend: 'up' },
      { id: '13', name: 'Số KH/CĐT mới', value: 42, target: 48, category: 'client', trend: 'flat' },
      { id: '14', name: 'Số báo giá mới', value: 85, target: 120, category: 'quote', trend: 'up' },
      {
        id: '15',
        name: 'Tỷ lệ chốt SBG',
        value: 35,
        target: 40,
        category: 'quote',
        trend: 'up',
        unit: '%',
      },
      {
        id: '16',
        name: 'Doanh số',
        value: 380000000,
        target: 450000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    yearly: [
      {
        id: '17',
        name: 'Số đối tác mới',
        value: 120,
        target: 240,
        category: 'partner',
        trend: 'up',
      },
      { id: '18', name: 'Số KTS mới', value: 60, target: 100, category: 'architect', trend: 'up' },
      { id: '19', name: 'Số KH/CĐT mới', value: 165, target: 192, category: 'client', trend: 'up' },
      { id: '20', name: 'Số báo giá mới', value: 340, target: 480, category: 'quote', trend: 'up' },
      {
        id: '21',
        name: 'Tỷ lệ chốt SBG',
        value: 38,
        target: 40,
        category: 'quote',
        trend: 'up',
        unit: '%',
      },
      {
        id: '22',
        name: 'Doanh số',
        value: 1500000000,
        target: 1800000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
  },
  team: {
    weekly: [
      { id: '23', name: 'Số đối tác mới', value: 12, target: 15, category: 'partner', trend: 'up' },
      { id: '24', name: 'Số KTS mới', value: 8, target: 9, category: 'architect', trend: 'up' },
      { id: '25', name: 'Số KH/CĐT mới', value: 14, target: 12, category: 'client', trend: 'up' },
      { id: '26', name: 'Số báo giá mới', value: 25, target: 30, category: 'quote', trend: 'flat' },
    ],
    monthly: [
      { id: '27', name: 'Số đối tác mới', value: 48, target: 60, category: 'partner', trend: 'up' },
      { id: '28', name: 'Số KTS mới', value: 32, target: 36, category: 'architect', trend: 'up' },
      { id: '29', name: 'Số KH/CĐT mới', value: 56, target: 48, category: 'client', trend: 'up' },
      {
        id: '30',
        name: 'Số báo giá mới',
        value: 100,
        target: 120,
        category: 'quote',
        trend: 'flat',
      },
      {
        id: '31',
        name: 'Tỷ lệ chốt SBG',
        value: 42,
        target: 40,
        category: 'quote',
        trend: 'up',
        unit: '%',
      },
      {
        id: '32',
        name: 'Doanh số',
        value: 480000000,
        target: 450000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    quarterly: [
      {
        id: '33',
        name: 'Doanh số',
        value: 1420000000,
        target: 1350000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    yearly: [
      {
        id: '34',
        name: 'Doanh số',
        value: 5700000000,
        target: 5400000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
  },
  department: {
    weekly: [
      {
        id: '35',
        name: 'Số đối tác mới',
        value: 25,
        target: 30,
        category: 'partner',
        trend: 'flat',
      },
      { id: '36', name: 'Số KTS mới', value: 18, target: 18, category: 'architect', trend: 'up' },
      { id: '37', name: 'Số KH/CĐT mới', value: 30, target: 24, category: 'client', trend: 'up' },
      { id: '38', name: 'Số báo giá mới', value: 60, target: 60, category: 'quote', trend: 'up' },
    ],
    monthly: [
      {
        id: '39',
        name: 'Số đối tác mới',
        value: 100,
        target: 120,
        category: 'partner',
        trend: 'flat',
      },
      { id: '40', name: 'Số KTS mới', value: 72, target: 72, category: 'architect', trend: 'up' },
      { id: '41', name: 'Số KH/CĐT mới', value: 120, target: 96, category: 'client', trend: 'up' },
      { id: '42', name: 'Số báo giá mới', value: 240, target: 240, category: 'quote', trend: 'up' },
      {
        id: '43',
        name: 'Tỷ lệ chốt SBG',
        value: 45,
        target: 40,
        category: 'quote',
        trend: 'up',
        unit: '%',
      },
      {
        id: '44',
        name: 'Doanh số',
        value: 960000000,
        target: 900000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    quarterly: [
      {
        id: '45',
        name: 'Doanh số',
        value: 2840000000,
        target: 2700000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
    yearly: [
      {
        id: '46',
        name: 'Doanh số',
        value: 11400000000,
        target: 10800000000,
        category: 'revenue',
        trend: 'up',
        unit: 'VND',
      },
    ],
  },
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'partner':
      return 'bg-ios-blue';
    case 'architect':
      return 'bg-ios-green';
    case 'client':
      return 'bg-ios-orange';
    case 'quote':
      return 'bg-ios-yellow';
    case 'revenue':
      return 'bg-ios-purple';
    default:
      return 'bg-gray-400';
  }
};

const KpiOverview = () => {
  const [category, setCategory] = useState('personal');
  const [timeFrame, setTimeFrame] = useState('monthly');

  // Get KPIs based on selected category and time frame
  const selectedKpis =
    kpiData[category as keyof typeof kpiData][timeFrame as keyof typeof kpiData.personal] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className={category === cat.id ? 'bg-primary text-white' : ''}
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {timeFrames.map((time) => (
            <button
              key={time.id}
              onClick={() => setTimeFrame(time.id)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeFrame === time.id
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {time.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedKpis.map((kpi) => (
          <KpiProgressCard
            key={kpi.id}
            title={kpi.name}
            value={kpi.value}
            target={kpi.target}
            progress={(kpi.value / kpi.target) * 100}
            trend={kpi.trend}
            colorClass={getCategoryColor(kpi.category)}
            unit={kpi.unit}
          />
        ))}
      </div>
    </div>
  );
};

export default KpiOverview;
