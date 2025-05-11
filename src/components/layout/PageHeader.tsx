
import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-6 px-4 md:px-6 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="mt-4 md:mt-0 flex items-center space-x-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
