import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navLinks: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/models", label: "Modelos", icon: "👩‍🎤" },
  { href: "/admin/models/1/media", label: "Mídias", icon: "🖼️" }, // Link genérico, pode ser ajustado para página global de mídia depois
  { href: "/admin/banners", label: "Banners/Destaques", icon: "⭐" },
  { href: "/admin/config", label: "Configurar", icon: "⚙️" },
  { href: "/admin/tutorial", label: "Tutorial", icon: "📖" },
];

export default function AdminSidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="h-screen bg-gray-900 text-white flex flex-col w-56 py-8 px-3 fixed inset-y-0 left-0 z-40 shadow-xl">
      <div className="mb-9 px-3">
        <span className="text-2xl font-bold">Admin</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 rounded hover:bg-gray-800 gap-3 transition-colors ${pathname?.startsWith(link.href) ? 'bg-gray-800 font-bold border-l-4 border-blue-500' : ''}`}
          >
            <span>{link.icon}</span> <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <button onClick={onLogout} className="mt-auto px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition mb-2">Logout</button>
    </aside>
  );
}
