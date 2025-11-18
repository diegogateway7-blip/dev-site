import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Se as variáveis de ambiente não estiverem configuradas, redireciona para /modelos
    if (!supabaseUrl || !supabaseAnonKey) {
      redirect('/modelos');
    }

    const supabase = createServer();
    const { data, error } = await supabase.from('models').select('slug').order('created_at', { ascending: true }).limit(1);

    if (error) {
      console.error('Erro ao buscar modelos:', error);
      redirect('/modelos');
    }

    const firstSlug = data?.[0]?.slug;
    if (firstSlug) {
      redirect(`/modelos/${firstSlug}`);
    }

    redirect('/modelos');
  } catch (error) {
    // Em caso de qualquer erro, redireciona para /modelos
    console.error('Erro ao carregar página inicial:', error);
    redirect('/modelos');
  }
}
