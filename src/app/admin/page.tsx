"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Se não está autenticado, mas a config do Supabase pode não estar feita
      const ok = localStorage.getItem("admin-auth") === "1";
      const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      // Também verifica variáveis runtime
      const urlRuntime = window.__SUPABASE_URL || '';
      const anonRuntime = window.__SUPABASE_ANON_KEY || '';
      if ((!urlSupabase && !urlRuntime) || (!anon && !anonRuntime)) {
        router.push("/admin/config");
        return;
      }
      if (!ok) {
        router.push("/admin/login");
        return;
      }
      setChecking(false);
    }
  }, [router]);

  if (checking) return <div className="text-lg">Carregando...</div>;
  return <div className="text-xl">Bem-vindo ao Painel Administrativo</div>;
}
