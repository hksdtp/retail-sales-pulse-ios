import React, { useEffect, useState } from 'react';
import { stagewiseConfig } from '@/config/stagewise';

/**
 * Stagewise Wrapper Component
 * 
 * This component handles the initialization and management of the Stagewise toolbar
 * for visual coding with AI agents.
 */
const StagewiseWrapper: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load in development mode
    if (!import.meta.env.DEV) {
      console.log('🚫 Stagewise disabled in production mode');
      return;
    }

    const loadStagewise = async () => {
      try {
        console.log('🔄 Loading Stagewise Toolbar...');
        
        // Dynamic import to avoid bundling in production
        const { StagewiseToolbar } = await import('@stagewise/toolbar-react');
        
        console.log('✅ Stagewise Toolbar loaded successfully');
        console.log('💡 You can now:');
        console.log('  1. Select any element on the page');
        console.log('  2. Leave a comment about what you want to change');
        console.log('  3. Let your AI agent make the changes!');
        
        setIsLoaded(true);
        
        // Return the component for rendering
        return StagewiseToolbar;
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn('⚠️ Failed to load Stagewise Toolbar:', errorMessage);
        setError(errorMessage);
      }
    };

    loadStagewise();
  }, []);

  // Don't render anything in production
  if (!import.meta.env.DEV) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#ff0000',
          zIndex: 999999,
          maxWidth: '300px',
        }}
      >
        ⚠️ Stagewise failed to load: {error}
      </div>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 122, 255, 0.1)',
          border: '1px solid rgba(0, 122, 255, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#007AFF',
          zIndex: 999999,
        }}
      >
        🔄 Loading Stagewise...
      </div>
    );
  }

  // The actual Stagewise toolbar will be rendered by the library itself
  // This component just handles the initialization
  return null;
};

export default StagewiseWrapper;
