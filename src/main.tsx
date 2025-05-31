import '../setup-sheets.js'; // Thêm dòng này để chạy script cấu hình
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/macos.css'
import './styles/login-theme.css'

createRoot(document.getElementById("root")!).render(<App />);
