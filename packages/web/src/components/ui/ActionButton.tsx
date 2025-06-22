import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  RotateCcw, 
  Settings, 
  User, 
  Edit3, 
  Save, 
  X, 
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Icon mapping system để tránh trùng lặp
const ICON_MAP = {
  // Data operations
  'refresh-data': RefreshCw,      // Reload data từ external source
  'reload-ui': RotateCcw,         // Refresh UI state only
  'reset-state': RotateCcw,       // Reset to initial state
  
  // Settings operations
  'system-settings': Settings,    // System/app settings
  'user-profile': User,           // User account settings
  'edit-mode': Edit3,             // Enter edit mode
  
  // Actions
  'save': Save,                   // Save changes
  'cancel': X,                    // Cancel operation
  'export': Download,             // Export data
  'upload': Upload,               // Upload/sync data
  'delete': Trash2,               // Delete operation
  
  // Status indicators
  'success': CheckCircle,         // Success state
  'pending': Clock,               // Pending state
  'error': AlertCircle,           // Error state
  'loading': Loader2,             // Loading state
} as const;

type IconType = keyof typeof ICON_MAP;

interface ActionButtonProps {
  // Core props
  iconType: IconType;
  children: React.ReactNode;
  onClick?: () => void;
  
  // Button variants
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  // States
  disabled?: boolean;
  loading?: boolean;
  
  // Styling
  className?: string;
  
  // Accessibility
  'aria-label'?: string;
  title?: string;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({
  iconType,
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  title,
  ...props
}, ref) => {
  const IconComponent = ICON_MAP[iconType];

  // Auto-generate aria-label if not provided
  const autoAriaLabel = ariaLabel || `${iconType.replace('-', ' ')} button`;

  return (
    <Button
      ref={ref}
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={className}
      aria-label={autoAriaLabel}
      title={title}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <IconComponent className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );
});
ActionButton.displayName = 'ActionButton';

// Specialized button components để tránh confusion
export const RefreshButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'> & { type?: 'data' | 'ui' }>(({
  type = 'data',
  ...props
}, ref) => (
  <ActionButton
    ref={ref}
    iconType={type === 'data' ? 'refresh-data' : 'reload-ui'}
    {...props}
  />
));
RefreshButton.displayName = 'RefreshButton';

export const SettingsButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'> & { type?: 'system' | 'user' }>(({
  type = 'system',
  ...props
}, ref) => (
  <ActionButton
    ref={ref}
    iconType={type === 'system' ? 'system-settings' : 'user-profile'}
    {...props}
  />
));
SettingsButton.displayName = 'SettingsButton';

export const SaveButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'>>((props, ref) => (
  <ActionButton ref={ref} iconType="save" {...props} />
));
SaveButton.displayName = 'SaveButton';

export const CancelButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'>>((props, ref) => (
  <ActionButton ref={ref} iconType="cancel" variant="outline" {...props} />
));
CancelButton.displayName = 'CancelButton';

export const ExportButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'>>((props, ref) => (
  <ActionButton iconType="export" variant="outline" ref={ref} {...props} />
));
ExportButton.displayName = 'ExportButton';

export const SyncButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'>>((props, ref) => (
  <ActionButton ref={ref} iconType="upload" {...props} />
));
SyncButton.displayName = 'SyncButton';

export const DeleteButton = React.forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'iconType'>>((props, ref) => (
  <ActionButton ref={ref} iconType="delete" variant="destructive" {...props} />
));
DeleteButton.displayName = 'DeleteButton';

// Usage examples:
/*
// Instead of:
<Button onClick={handleRefresh}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Làm mới
</Button>

// Use:
<RefreshButton type="data" onClick={handleRefresh}>
  Làm mới dữ liệu
</RefreshButton>

<RefreshButton type="ui" onClick={handleReloadUI}>
  Làm mới giao diện
</RefreshButton>

// Settings buttons:
<SettingsButton type="system" onClick={() => navigate('/settings')}>
  Cài đặt hệ thống
</SettingsButton>

<SettingsButton type="user" onClick={() => setShowAccountModal(true)}>
  Cài đặt tài khoản
</SettingsButton>
*/
