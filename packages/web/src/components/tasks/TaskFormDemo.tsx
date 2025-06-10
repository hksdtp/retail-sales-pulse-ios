import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TaskFormDialog from './TaskFormDialog';

const TaskFormDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<'self' | 'team' | 'individual'>('self');

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Task Form Demo - Enhanced UI</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Enhanced Task Creation Form</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                setFormType('self');
                setIsOpen(true);
              }}
              className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Tạo công việc cá nhân</div>
                <div className="text-sm opacity-90">Self Task</div>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                setFormType('team');
                setIsOpen(true);
              }}
              className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Giao cho nhóm</div>
                <div className="text-sm opacity-90">Team Task</div>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                setFormType('individual');
                setIsOpen(true);
              }}
              className="h-16 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Giao cho cá nhân</div>
                <div className="text-sm opacity-90">Individual Task</div>
              </div>
            </Button>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Enhanced Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Nhóm màu cho loại công việc</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Trạng thái với icons và màu sắc</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Mức độ ưu tiên với badges</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Calendar picker đẹp với tiếng Việt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Ngày mặc định là hôm nay</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Animations mượt mà</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        formType={formType}
        onTaskCreated={() => {
          console.log('Task created successfully!');
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export default TaskFormDemo;
