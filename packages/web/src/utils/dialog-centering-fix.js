// Dialog Centering Fix - Force center all dialogs
(function() {
  'use strict';
  
  console.log('🔧 Dialog Centering Fix loaded');
  
  // Function to center a dialog element
  function centerDialog(element) {
    if (!element) return;
    
    // Apply centering styles with highest priority
    const styles = {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      margin: '0',
      right: 'auto',
      bottom: 'auto',
      zIndex: '10000',
      maxWidth: '600px',
      width: 'calc(100vw - 32px)',
      maxHeight: '85vh',
      overflowY: 'auto'
    };
    
    Object.keys(styles).forEach(key => {
      element.style.setProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase(), styles[key], 'important');
    });
    
    console.log('✅ Dialog centered:', element);
  }
  
  // Function to fix overlay
  function fixOverlay(element) {
    if (!element) return;
    
    const styles = {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '9998',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)'
    };
    
    Object.keys(styles).forEach(key => {
      element.style.setProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase(), styles[key], 'important');
    });
    
    console.log('✅ Overlay fixed:', element);
  }
  
  // Observer to watch for dialog elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for dialog content
          if (node.hasAttribute && node.hasAttribute('data-radix-dialog-content')) {
            console.log('🎯 Found dialog content:', node);
            centerDialog(node);
          }
          
          // Check for dialog overlay
          if (node.hasAttribute && node.hasAttribute('data-radix-dialog-overlay')) {
            console.log('🎯 Found dialog overlay:', node);
            fixOverlay(node);
          }
          
          // Check children
          const dialogContents = node.querySelectorAll ? node.querySelectorAll('[data-radix-dialog-content]') : [];
          const dialogOverlays = node.querySelectorAll ? node.querySelectorAll('[data-radix-dialog-overlay]') : [];
          
          dialogContents.forEach(centerDialog);
          dialogOverlays.forEach(fixOverlay);
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Fix existing dialogs
  function fixExistingDialogs() {
    const existingDialogs = document.querySelectorAll('[data-radix-dialog-content]');
    const existingOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    
    existingDialogs.forEach(centerDialog);
    existingOverlays.forEach(fixOverlay);
    
    if (existingDialogs.length > 0 || existingOverlays.length > 0) {
      console.log(`🔄 Fixed ${existingDialogs.length} dialogs and ${existingOverlays.length} overlays`);
    }
  }
  
  // Run immediately and on DOM ready
  fixExistingDialogs();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixExistingDialogs);
  }
  
  // Also run on window resize to maintain centering
  window.addEventListener('resize', () => {
    setTimeout(fixExistingDialogs, 100);
  });
  
  // Expose global function for manual fixing
  window.fixDialogCentering = fixExistingDialogs;
  
  console.log('🚀 Dialog Centering Fix initialized');
})();
