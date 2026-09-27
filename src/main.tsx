import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StudioProvider } from './state/StudioContext';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container is missing from the document.');

createRoot(container).render(
  <StrictMode>
    <StudioProvider>
      <App />
    </StudioProvider>
  </StrictMode>,
);
