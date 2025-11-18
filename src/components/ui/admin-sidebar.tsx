"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  Star,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight,
  CloudUpload,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/models", label: "Modelos", icon: Users },
  { href: "/admin/media-search", label: "Mídias", icon: ImageIcon },
  { href: "/admin/media-import", label: "Importar Mídias", icon: CloudUpload },
  { href: "/admin/banners", label: "Banners", icon: Star },
  { href: "/admin/config", label: "Configurar", icon: Settings },
  { href: "/admin/tutorial", label: "Tutorial", icon: BookOpen },
];

export default function AdminSidebar() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const isActive = (href: string) => {
    // A rota exata é sempre a mais prioritária
    if (pathname === href) return true;
    // Para rotas aninhadas, verifica se o pathname começa com o href,
    // mas garante que não seja a rota raiz do admin para não destacar tudo.
    return href !== "/admin/dashboard" && pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({ title: "Logout realizado com sucesso!" });
      router.push('/admin/login');
      router.refresh(); // Limpa o cache de rotas
    } else {
      toast({ title: "Erro no logout", description: error.message, variant: "destructive" });
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-60 flex-col border-r border-white/10 bg-[color:var(--surface-card)] p-4 text-white shadow-soft backdrop-blur-3xl lg:flex">
      <div className="mb-8 px-2">
        <span className="font-headline text-2xl font-bold">Admin Panel</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navLinks.map(link => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors
                ${active
                  ? 'bg-white/10 font-semibold text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </div>
              {active && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-red-500/20 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
