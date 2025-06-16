// Thêm dòng này để chạy script cấu hình
import { createRoot } from 'react-dom/client';

import '../setup-sheets.js';
import App from './App.tsx';
import './index.css';
import './styles/dark-theme.css';
import './styles/login-theme.css';
import './styles/macos.css';
import './utils/dialog-centering-fix.js';
import './utils/versionManager.ts';
import './utils/cacheHelper.ts';
import './utils/test-kpi.ts';

createRoot(document.getElementById('root')!).render(<App />);
