"use client";
import React, { useEffect, useRef, Suspense } from 'react'; // Adicionado Suspense
import AdminSidebar from '@/components/ui/admin-sidebar';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ProgressBar } from '@/components/ui/progress-bar'; // Importa o ProgressBar

const SESSION_TIMEOUT_MIN = 30;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout|number|null>(null);

  function handleLogout(manual = false) {
    localStorage.removeItem('admin-auth');
    if (!manual) toast({ title: 'Sessão encerrada por inatividade.' });
    router.push('/admin/login');
  }
  function resetTimeout() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current as number);
    timeoutRef.current = setTimeout(() => handleLogout(false), SESSION_TIMEOUT_MIN*60*1000);
  }
  useEffect(() => {
    resetTimeout();
    function activityHandler() { resetTimeout(); }
    window.addEventListener('click', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('scroll', activityHandler);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current as number);
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('scroll', activityHandler);
    };
    // eslint-disable-next-line
  }, []);

  // Efeito para verificar a autenticação
  useEffect(() => {
    const authData = localStorage.getItem('admin-auth');
    if (!authData) {
      router.replace('/admin/login');
    }
  }, [router]);

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
        <AdminSidebar onLogout={() => handleLogout(true)} />
        <div className="flex-1 ml-60">
          <main className="mx-auto max-w-6xl px-8 py-10">{children}</main>
        </div>
        </div>
    </div>
  );
}
