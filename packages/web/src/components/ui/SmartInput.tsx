import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Lightbulb, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import TaskSuggestionService, { TaskSuggestion } from '@/services/TaskSuggestionService';

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  taskType?: string;
  onSuggestionSelect?: (suggestion: TaskSuggestion) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({
  value,
  onChange,
  placeholder = "Nhập tiêu đề công việc...",
  className,
  disabled = false,
  taskType,
  onSuggestionSelect
}) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const suggestionService = TaskSuggestionService.getInstance();

  // Debounced search function
  const debouncedSearch = useCallback((searchValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      const results = suggestionService.getSuggestions(searchValue, 6);
      setSuggestions(results);
      setIsLoading(false);
      setSelectedIndex(-1);
    }, 150);
  }, [suggestionService]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 1) {
      debouncedSearch(newValue);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (value.length >= 1) {
      debouncedSearch(value);
      setShowSuggestions(true);
    } else {
      // Show recent suggestions when focused with empty input
      const recentSuggestions = suggestionService.getSuggestions('', 4);
      setSuggestions(recentSuggestions);
      setShowSuggestions(recentSuggestions.length > 0);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: TaskSuggestion) => {
    onChange(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    // Learn from selection
    suggestionService.learnFromTask(suggestion.title, taskType);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'KTS':
        return '📐';
      case 'SBG':
        return '🔧';
      case 'Customer':
        return '👥';
      case 'Partner':
        return '🤝';
      default:
        return '📋';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'KTS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SBG':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Partner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 transition-all duration-200",
            showSuggestions && suggestions.length > 0 && "rounded-b-none border-b-0",
            className
          )}
        />
        
        {/* Search/Loading Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-3 h-3" />
                <span>Gợi ý thông minh</span>
                {value.length === 0 && (
                  <span className="text-gray-400">• Gần đây</span>
                )}
              </div>
            </div>

            {/* Suggestions List */}
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  ref={el => suggestionRefs.current[index] = el}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "px-3 py-2.5 cursor-pointer transition-all duration-150 flex items-center gap-3 group",
                    selectedIndex === index
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  {/* Category Icon */}
                  <div className="flex-shrink-0 text-lg">
                    {getCategoryIcon(suggestion.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.title}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {/* Category Badge */}
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-medium",
                        getCategoryColor(suggestion.category)
                      )}>
                        {suggestion.category}
                      </span>

                      {/* Frequency & Recency */}
                      {suggestion.frequency > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{suggestion.frequency}x</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedIndex === index && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-xs text-gray-400 dark:text-gray-500">
                ↑↓ điều hướng • Enter chọn • Esc đóng
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartInput;
