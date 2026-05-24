/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ToastProvider } from './components/ToastProvider';
import { UserPortal } from './components/UserPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { CONFIG } from './config';
import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    // Set document title
    document.title = CONFIG.BRAND_NAME;

    // Check query params
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'admin') {
      setView('admin');
    }

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'admin') {
         setView('admin');
         window.history.pushState({}, '', '?view=admin');
      } else if (customEvent.detail === 'user') {
         setView('user');
         window.history.pushState({}, '', '?view=user');
      }
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {view === 'admin' ? <AdminDashboard /> : <UserPortal />}
      </ToastProvider>
    </ErrorBoundary>
  );
}
