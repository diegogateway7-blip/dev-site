import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
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
}
