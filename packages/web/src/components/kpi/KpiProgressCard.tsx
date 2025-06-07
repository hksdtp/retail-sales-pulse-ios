import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@/components/ui/card';

interface KpiProgressCardProps {
  title: string;
  value: number;
  target: number;
  progress: number;
  trend?: 'up' | 'down' | 'flat';
  colorClass?: string;
  unit?: string;
}

const KpiProgressCard = ({
  title,
  value,
  target,
  progress,
  trend = 'flat',
  colorClass = 'bg-ios-blue',
  unit = '',
}: KpiProgressCardProps) => {
  // Format value based on unit
  const formatValue = (val: number) => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(val);
    }
    return val.toString();
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-ios-green" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-ios-red" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-base">{title}</h3>
            {getTrendIcon()}
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-baseline">
              <div className="text-2xl font-bold">
                {formatValue(value)}
                <span className="text-sm font-normal ml-1">{unit}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Mục tiêu: {formatValue(target)}
                {unit}
              </div>
            </div>

            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${colorClass} h-2 rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="mt-2 text-right text-sm">{Math.round(progress)}% hoàn thành</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiProgressCard;
