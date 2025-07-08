import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import App from './App.tsx';
import './index.css';

// Import optimized styles
import '@/styles/dark-theme.css';
import '@/styles/login-theme.css';
import '@/styles/macos.css';

// Import essential utilities
import '@/utils/versionManager.ts';
import '@/utils/cacheHelper.ts';

// Render the main app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
