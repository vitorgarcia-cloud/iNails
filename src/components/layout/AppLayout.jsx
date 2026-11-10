import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Viewport (Mobile First Container) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default AppLayout;
