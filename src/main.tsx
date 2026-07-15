import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('[KIRA GLOBAL ERROR]', event.error?.message, event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[KIRA UNHANDLED REJECTION]', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
