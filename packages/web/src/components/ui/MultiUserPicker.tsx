import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  X, 
  Check, 
  ChevronDown, 
  User, 
  Crown,
  Shield,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserOption {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  isOnline?: boolean;
}

interface MultiUserPickerProps {
  users: UserOption[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSelection?: number;
  showRoles?: boolean;
  currentUserId?: string;
}

const MultiUserPicker: React.FC<MultiUserPickerProps> = ({
  users,
  selectedUserIds,
  onSelectionChange,
  placeholder = "Chọn người được giao việc...",
  className,
  disabled = false,
  maxSelection = 5,
  showRoles = true,
  currentUserId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>(users);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  // Get selected users
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  // Handle user selection toggle
  const handleUserToggle = (userId: string) => {
    if (disabled) return;

    if (selectedUserIds.includes(userId)) {
      // Remove user
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      // Add user (respect max selection)
      if (selectedUserIds.length < maxSelection) {
        onSelectionChange([...selectedUserIds, userId]);
      }
    }
  };

  // Handle remove user
  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedUserIds.filter(id => id !== userId));
  };

  // Handle clear all
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get role icon
  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'manager':
        return <Shield className="w-3 h-3 text-blue-500" />;
      case 'leader':
        return <UserCheck className="w-3 h-3 text-green-500" />;
      default:
        return <User className="w-3 h-3 text-gray-400" />;
    }
  };

  // Get role color
  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'manager':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'leader':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-[42px]",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "rounded-lg text-sm transition-all duration-200",
          "hover:border-gray-300 dark:hover:border-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
          
          {selectedUsers.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400 truncate">
              {placeholder}
            </span>
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Selected Users Display */}
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {selectedUsers.slice(0, 2).map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                  >
                    <span className="truncate max-w-[80px]">{user.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveUser(user.id, e)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {selectedUsers.length > 2 && (
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                    +{selectedUsers.length - 2}
                  </div>
                )}
              </div>

              {/* Clear All Button */}
              {selectedUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          )}
        </div>
        
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              {/* Selection Info */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{selectedUsers.length}/{maxSelection} đã chọn</span>
                {selectedUsers.length >= maxSelection && (
                  <span className="text-amber-600 dark:text-amber-400">
                    Đã đạt giới hạn
                  </span>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? 'Không tìm thấy người dùng' : 'Không có người dùng'}
                </div>
              ) : (
                <div className="p-2">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const isCurrentUser = user.id === currentUserId;
                    const canSelect = isSelected || selectedUserIds.length < maxSelection;
                    
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => canSelect && handleUserToggle(user.id)}
                        disabled={!canSelect}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : canSelect
                            ? "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                            : "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600"
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          
                          {/* Online Status */}
                          {user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {user.name}
                              {isCurrentUser && (
                                <span className="text-xs text-blue-500 ml-1">(Bạn)</span>
                              )}
                            </span>
                            {showRoles && user.role && getRoleIcon(user.role)}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5">
                            {user.email && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </span>
                            )}
                            {showRoles && user.role && (
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-medium",
                                getRoleColor(user.role)
                              )}>
                                {user.role}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div className="flex-shrink-0">
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiUserPicker;
