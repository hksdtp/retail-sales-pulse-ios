// Thêm dòng này để chạy script cấu hình
import { createRoot } from 'react-dom/client';

import '../setup-sheets.js';
import App from './App.tsx';
import './index.css';
import './styles/login-theme.css';
import './styles/macos.css';

createRoot(document.getElementById('root')!).render(<App />);
