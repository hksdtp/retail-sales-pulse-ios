import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import LuxuryCurtainApp from '@/components/curtain/LuxuryCurtainApp';

const CurtainDesign = () => {
  return (
    <AppLayout>
      <div className="-m-3 md:-m-6">
        <LuxuryCurtainApp />
      </div>
    </AppLayout>
  );
};

export default CurtainDesign;