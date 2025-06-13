import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import LuxuryCurtainApp from '@/components/curtain/LuxuryCurtainApp';
import AIDisabledOverlay from '@/components/ui/AIDisabledOverlay';

const CurtainDesign = () => {
  return (
    <AppLayout>
      <AIDisabledOverlay message="Tính năng thiết kế rèm AI tạm khóa để phát triển tiếp">
        <div className="-m-3 md:-m-6">
          <LuxuryCurtainApp />
        </div>
      </AIDisabledOverlay>
    </AppLayout>
  );
};

export default CurtainDesign;