import type { ToolbarConfig } from '@stagewise/toolbar-react';

/**
 * Stagewise Toolbar Configuration
 * 
 * This configuration enables visual coding with AI agents directly in the browser.
 * Users can select DOM elements, leave comments, and let AI agents make changes.
 */
export const stagewiseConfig: ToolbarConfig = {
  plugins: [
    // Add custom plugins here as needed
    // Example plugins might include:
    // - Component inspector
    // - State debugger
    // - Performance monitor
    // - Accessibility checker
  ],
  
  // Optional: Custom styling for the toolbar
  theme: {
    // You can customize the toolbar appearance here
    // primary: '#007AFF', // iOS blue
    // background: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
  },
  
  // Optional: Custom keyboard shortcuts
  shortcuts: {
    // toggle: 'cmd+shift+s', // Toggle toolbar visibility
    // inspect: 'cmd+shift+i', // Inspect element mode
  },
  
  // Optional: Integration settings
  integration: {
    // Framework-specific settings
    framework: 'react',
    
    // Development mode only
    enabled: import.meta.env.DEV,
    
    // Auto-connect to VS Code/Cursor extension
    autoConnect: true,
  },
};

/**
 * Initialize Stagewise Toolbar
 * 
 * This function should be called in development mode to enable
 * the visual coding toolbar.
 */
export const initStagewise = async () => {
  console.log('🚀 [Stagewise] Starting initialization...');
  console.log('🔍 [Stagewise] Environment check:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    hostname: window.location.hostname
  });

  if (!import.meta.env.DEV) {
    console.log('🚫 [Stagewise] Disabled in production mode');
    return;
  }

  try {
    console.log('📦 [Stagewise] Loading packages...');

    // Try to import packages
    const { StagewiseToolbar } = await import('@stagewise/toolbar-react');
    const { createRoot } = await import('react-dom/client');
    const React = await import('react');

    console.log('✅ [Stagewise] Packages loaded successfully');

    // Create toolbar container
    console.log('🏗️ [Stagewise] Creating toolbar container...');
    const toolbarRoot = document.createElement('div');
    toolbarRoot.id = 'stagewise-toolbar-root';
    toolbarRoot.style.position = 'fixed';
    toolbarRoot.style.zIndex = '999999';
    toolbarRoot.style.pointerEvents = 'none'; // Allow clicks to pass through
    toolbarRoot.style.top = '0';
    toolbarRoot.style.left = '0';
    document.body.appendChild(toolbarRoot);

    console.log('✅ [Stagewise] Toolbar container created');

    // Store config globally for debugging
    (window as any).stagewiseConfig = stagewiseConfig;
    console.log('🔧 [Stagewise] Config stored globally');

    // Render toolbar
    console.log('🎨 [Stagewise] Rendering toolbar...');
    createRoot(toolbarRoot).render(
      React.createElement(React.StrictMode, null,
        React.createElement(StagewiseToolbar, { config: stagewiseConfig })
      )
    );

    console.log('✅ [Stagewise] Toolbar initialized successfully!');
    console.log('💡 [Stagewise] You can now:');
    console.log('   - Select any DOM element in your app');
    console.log('   - Leave comments on UI components');
    console.log('   - Send context directly to your AI agent');
    console.log('   - Get intelligent code suggestions');
    console.log('🔧 [Stagewise] Config available at window.stagewiseConfig');

  } catch (error) {
    console.error('❌ [Stagewise] Failed to initialize toolbar:', error);
    console.log('💡 [Stagewise] Make sure you have installed the VS Code extension:');
    console.log('   https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension');
  }
};

export default stagewiseConfig;
