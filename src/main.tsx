import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { JotaiProvider } from '@/app/providers/JotaiProvider';
import { App } from '@/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </QueryProvider>
  </StrictMode>,
);
