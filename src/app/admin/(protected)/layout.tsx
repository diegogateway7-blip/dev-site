import React, { Suspense } from 'react';
import AdminSidebar from '@/components/ui/admin-sidebar';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))] text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(216,93,178,0.18),transparent_35%)]"
      />
      <div className="relative z-10 flex min-h-screen">
        {/* Suspense é necessário porque ProgressBar usa hooks de navegação */}
        <Suspense fallback={null}>
            <ProgressBar />
        </Suspense>
        <AdminSidebar />
        <div className="flex-1 lg:ml-60">
          <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
        </div>
        </div>
    </div>
  );
}
