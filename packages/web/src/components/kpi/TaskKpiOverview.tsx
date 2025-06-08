import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { TaskKpiItem, getTaskKpiData } from '@/utils/taskKpiUtils';

import KpiProgressCard from './KpiProgressCard';

const TaskKpiOverview = () => {
  const { currentUser } = useAuth();
  const kpiData = getTaskKpiData(currentUser);

  // Nhóm các loại công việc để hiển thị
  const partnerItems = kpiData.items.filter(
    (item) => item.category === 'partner_new' || item.category === 'partner_old',
  );

  const architectItems = kpiData.items.filter(
    (item) => item.category === 'architect_new' || item.category === 'architect_old',
  );

  const clientItems = kpiData.items.filter(
    (item) => item.category === 'client_new' || item.category === 'client_old',
  );

  const quoteItems = kpiData.items.filter(
    (item) => item.category === 'quote_new' || item.category === 'quote_old',
  );

  const otherItems = kpiData.items.filter((item) => item.category === 'other');

  return (
    <div className="space-y-6">
      {/* Tổng quan KPI */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tổng quan KPI theo loại công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <div>
                <span className="text-sm font-medium">Tiến độ tổng thể</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({kpiData.completedTasks}/{kpiData.totalTasks} công việc hoàn thành)
                </span>
              </div>
              <span className="text-sm font-medium">
                {Math.round(kpiData.overallCompletionRate)}%
              </span>
            </div>
            <Progress value={kpiData.overallCompletionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* KPI theo loại công việc */}
      <Tabs defaultValue="partner" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="partner">Đối tác</TabsTrigger>
          <TabsTrigger value="architect">KTS</TabsTrigger>
          <TabsTrigger value="client">Khách hàng</TabsTrigger>
          <TabsTrigger value="quote">Báo giá</TabsTrigger>
          <TabsTrigger value="other">Khác</TabsTrigger>
        </TabsList>

        <TabsContent value="partner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerItems.map((item, index) => (
              <KpiProgressCard
                key={index}
                title={item.type}
                value={item.completed}
                target={item.targetCount}
                progress={item.progressPercent}
                trend={item.trend}
                colorClass={item.category === 'partner_new' ? 'bg-blue-500' : 'bg-blue-400'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architect" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architectItems.map((item, index) => (
              <KpiProgressCard
                key={index}
                title={item.type}
                value={item.completed}
                target={item.targetCount}
                progress={item.progressPercent}
                trend={item.trend}
                colorClass={item.category === 'architect_new' ? 'bg-green-500' : 'bg-green-400'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="client" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientItems.map((item, index) => (
              <KpiProgressCard
                key={index}
                title={item.type}
                value={item.completed}
                target={item.targetCount}
                progress={item.progressPercent}
                trend={item.trend}
                colorClass={item.category === 'client_new' ? 'bg-orange-500' : 'bg-orange-400'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quote" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quoteItems.map((item, index) => (
              <KpiProgressCard
                key={index}
                title={item.type}
                value={item.completed}
                target={item.targetCount}
                progress={item.progressPercent}
                trend={item.trend}
                colorClass={item.category === 'quote_new' ? 'bg-yellow-500' : 'bg-yellow-400'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherItems.map((item, index) => (
              <KpiProgressCard
                key={index}
                title={item.type}
                value={item.completed}
                target={item.targetCount}
                progress={item.progressPercent}
                trend={item.trend}
                colorClass="bg-purple-500"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tỷ lệ chuyển đổi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Báo giá → Đơn hàng</span>
                <span className="font-medium">
                  {Math.round(kpiData.conversionRates.quoteToOrder)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-ios-green h-2 rounded-full"
                  style={{ width: `${kpiData.conversionRates.quoteToOrder}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>KH tiềm năng → KH thực tế</span>
                <span className="font-medium">
                  {Math.round(kpiData.conversionRates.potentialToActual)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-ios-blue h-2 rounded-full"
                  style={{ width: `${kpiData.conversionRates.potentialToActual}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>KTS tiềm năng → Dự án</span>
                <span className="font-medium">
                  {Math.round(kpiData.conversionRates.architectToPrj)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-ios-orange h-2 rounded-full"
                  style={{ width: `${kpiData.conversionRates.architectToPrj}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskKpiOverview;
