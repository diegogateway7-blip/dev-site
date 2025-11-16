"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Usuário ou senha inválidos");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin-auth", "1");
      router.push("/admin");
    } catch (e) {
      setError("Erro ao tentar logar");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Login de Administrador</h2>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Senha</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-70" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        {error && <div className="mt-2 text-red-600 text-sm text-center">{error}</div>}
      </form>
    </div>
  );
}
