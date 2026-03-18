import '../../src/theme.css';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../../src/utils/useTheme';
import { ToastProvider } from '../../src/ToastProvider';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
);
