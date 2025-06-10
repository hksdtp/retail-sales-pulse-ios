import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TaskSkeleton = () => {
  return (
    <Card className="macos-card mb-3 overflow-hidden">
      <CardContent className="p-4">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md mb-2 animate-shimmer bg-[length:200%_100%]" 
                 style={{ width: '75%' }} />
            
            {/* Description skeleton */}
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md mb-2 animate-shimmer bg-[length:200%_100%]" 
                 style={{ width: '90%' }} />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-shimmer bg-[length:200%_100%]" 
                 style={{ width: '60%' }} />
          </div>
          
          {/* Status badge skeleton */}
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-shimmer bg-[length:200%_100%]" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Date skeleton */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
              <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
            </div>
            
            {/* Priority skeleton */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
              <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
          
          {/* Progress skeleton */}
          <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskSkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <TaskSkeleton key={index} />
      ))}
    </div>
  );
};

export { TaskSkeleton, TaskSkeletonList };
