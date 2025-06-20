import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  FilePen, 
  FileText, 
  Users, 
  UserCheck, 
  Globe, 
  UserPlus, 
  Building, 
  DollarSign,
  ChevronDown,
  Check,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskTypeConfig {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
}

export const taskTypeConfig: Record<string, TaskTypeConfig> = {
  'other': {
    label: 'Công việc khác',
    icon: Briefcase,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
    description: 'Các công việc tổng quát khác'
  },
  'sbg-new': {
    label: 'SBG mới',
    icon: FileText,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40',
    description: 'Sửa chữa bảo dưỡng mới'
  },
  'sbg-old': {
    label: 'SBG cũ',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30',
    description: 'Sửa chữa bảo dưỡng cũ'
  },
  'partner-new': {
    label: 'Đối tác mới',
    icon: FilePen,
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40',
    description: 'Làm việc với đối tác mới'
  },
  'partner-old': {
    label: 'Đối tác cũ',
    icon: FilePen,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30',
    description: 'Làm việc với đối tác cũ'
  },
  'kts-new': {
    label: 'KTS mới',
    icon: Grid3X3,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40',
    description: 'Khảo sát thiết kế mới'
  },
  'kts-old': {
    label: 'KTS cũ',
    icon: Grid3X3,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30',
    description: 'Khảo sát thiết kế cũ'
  },
  'customer-new': {
    label: 'Khách hàng mới',
    icon: UserPlus,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/40',
    description: 'Làm việc với khách hàng mới'
  },
  'customer-old': {
    label: 'Khách hàng cũ',
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-800/30',
    description: 'Làm việc với khách hàng cũ'
  }
};

interface TaskTypeSelectorProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  className?: string;
  disabled?: boolean;
  layout?: 'pills' | 'grid' | 'dropdown';
  maxSelection?: number;
}

const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({
  selectedTypes,
  onTypesChange,
  className,
  disabled = false,
  layout = 'pills',
  maxSelection = 3
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTypeToggle = (typeKey: string) => {
    if (disabled) return;

    if (selectedTypes.includes(typeKey)) {
      // Remove type
      onTypesChange(selectedTypes.filter(t => t !== typeKey));
    } else {
      // Add type (respect max selection)
      if (selectedTypes.length < maxSelection) {
        onTypesChange([...selectedTypes, typeKey]);
      }
    }
  };

  const renderPillLayout = () => (
    <div className={cn("flex flex-wrap gap-1.5 sm:gap-2", className)}>
      {Object.entries(taskTypeConfig).map(([key, config]) => {
        const IconComponent = config.icon;
        const isSelected = selectedTypes.includes(key);
        
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => handleTypeToggle(key)}
            disabled={disabled || (!isSelected && selectedTypes.length >= maxSelection)}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
              "relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2",
              "rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
              "border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              isSelected
                ? "border-blue-500 bg-blue-500 text-white shadow-md"
                : cn(
                    config.bgColor,
                    config.color,
                    "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  ),
              disabled && "opacity-50 cursor-not-allowed",
              !isSelected && selectedTypes.length >= maxSelection && "opacity-40 cursor-not-allowed"
            )}
          >
            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{config.label}</span>
            
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full flex items-center justify-center ml-1"
              >
                <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderGridLayout = () => (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3", className)}>
      {Object.entries(taskTypeConfig).map(([key, config]) => {
        const IconComponent = config.icon;
        const isSelected = selectedTypes.includes(key);
        
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => handleTypeToggle(key)}
            disabled={disabled || (!isSelected && selectedTypes.length >= maxSelection)}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 sm:p-4",
              "rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
              "border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              isSelected
                ? "border-blue-500 bg-blue-500 text-white shadow-md"
                : cn(
                    config.bgColor,
                    config.color,
                    "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  ),
              disabled && "opacity-50 cursor-not-allowed",
              !isSelected && selectedTypes.length >= maxSelection && "opacity-40 cursor-not-allowed"
            )}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="text-center leading-tight">{config.label}</span>
            
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderDropdownLayout = () => (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "rounded-lg text-sm font-medium transition-all duration-200",
          "hover:border-gray-300 dark:hover:border-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2">
          {selectedTypes.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">Chọn loại công việc...</span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-gray-900 dark:text-gray-100">
                {selectedTypes.length} loại đã chọn
              </span>
              {selectedTypes.length > 0 && (
                <div className="flex -space-x-1">
                  {selectedTypes.slice(0, 3).map(type => {
                    const config = taskTypeConfig[type];
                    const IconComponent = config.icon;
                    return (
                      <div
                        key={type}
                        className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border border-white dark:border-gray-800"
                      >
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                    );
                  })}
                  {selectedTypes.length > 3 && (
                    <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center border border-white dark:border-gray-800 text-xs text-white">
                      +{selectedTypes.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isDropdownOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-[10001] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              {Object.entries(taskTypeConfig).map(([key, config]) => {
                const IconComponent = config.icon;
                const isSelected = selectedTypes.includes(key);
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeToggle(key)}
                    disabled={disabled || (!isSelected && selectedTypes.length >= maxSelection)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300",
                      disabled && "opacity-50 cursor-not-allowed",
                      !isSelected && selectedTypes.length >= maxSelection && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {config.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {selectedTypes.length >= maxSelection && (
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Tối đa {maxSelection} loại công việc
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-task-type-selector]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <div data-task-type-selector>
      {layout === 'pills' && renderPillLayout()}
      {layout === 'grid' && renderGridLayout()}
      {layout === 'dropdown' && renderDropdownLayout()}
      
      {/* Selection Info */}
      {selectedTypes.length > 0 && layout !== 'dropdown' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {selectedTypes.length}/{maxSelection} loại đã chọn
          {selectedTypes.length >= maxSelection && (
            <span className="text-amber-600 dark:text-amber-400 ml-2">
              • Đã đạt giới hạn
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskTypeSelector;
