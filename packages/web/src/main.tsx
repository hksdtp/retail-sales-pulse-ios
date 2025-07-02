// Thêm dòng này để chạy script cấu hình
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import '../setup-sheets.js';
import App from './App.tsx';
import './index.css';

// ⚠️ REMOVED: Supabase initialization moved to centralized service
// Supabase will be initialized by SupabaseService when needed
console.log('ℹ️ [main.tsx] Supabase initialization delegated to SupabaseService');
import '@styles/dark-theme.css';
import '@styles/login-theme.css';
import '@styles/macos.css';
import '@utils/dialog-centering-fix.js';
import '@utils/versionManager.ts';
import '@utils/cacheHelper.ts';
import '@utils/test-kpi.ts';

// Render the main app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Stagewise integration removed - cleaned up codebase
