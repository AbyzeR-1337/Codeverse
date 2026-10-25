import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import { startAutoSync } from './store/sync';
import { ensureQuests, unlock } from './store/actions';

ensureQuests();
const hour = new Date().getHours();
if (hour >= 0 && hour < 4) setTimeout(() => unlock('night-owl'), 3000);
if (hour >= 4 && hour < 7) setTimeout(() => unlock('early-bird'), 3000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

startAutoSync();

// Офлайн-режим и установка как приложения (PWA) — только в собранной версии.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* без офлайн-режима приложение всё равно работает */
    });
  });
}
