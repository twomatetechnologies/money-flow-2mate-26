
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex justify-end p-4 border-b">
          <UserMenu />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
