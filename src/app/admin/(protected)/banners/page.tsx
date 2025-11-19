import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminBannersPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Banners (removido)</CardTitle>
          <CardDescription>O recurso de Banners foi temporariamente desativado. Volte mais tarde.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/70">Removemos temporariamente a interface de gerenciamento de banners. Se precisar restaurar, avise e eu reabilito a funcionalidade.</p>
        </CardContent>
      </Card>
    </div>
  );
}
