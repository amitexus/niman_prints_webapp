
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
