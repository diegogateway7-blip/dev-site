"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/models", label: "Modelos", icon: Users },
  { href: "/admin/media-search", label: "Mídias", icon: ImageIcon },
  { href: "/admin/media-import", label: "Importar Mídias", icon: CloudUpload },
  { href: "/admin/banners", label: "Banners", icon: Star },
  { href: "/admin/config", label: "Configurar", icon: Settings },
  { href: "/admin/tutorial", label: "Tutorial", icon: BookOpen },
];

export default function AdminSidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname() || "";

  const isActive = (href: string) => {
    // A rota exata é sempre a mais prioritária
    if (pathname === href) return true;
    // Para rotas aninhadas, verifica se o pathname começa com o href,
    // mas garante que não seja a rota raiz do admin para não destacar tudo.
    return href !== "/admin/dashboard" && pathname.startsWith(href);
  };

  return (
    <aside className="h-screen bg-[color:var(--surface-card)] text-white flex flex-col w-60 p-4 fixed inset-y-0 left-0 z-40 border-r border-white/10 shadow-soft backdrop-blur-3xl">
      <div className="mb-8 px-2">
        <span className="text-2xl font-bold font-headline">Admin Panel</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map(link => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors
                ${active
                  ? 'bg-white/10 text-white font-semibold'
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
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-white/70 hover:bg-red-500/20 hover:text-white transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
