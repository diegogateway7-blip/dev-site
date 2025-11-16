'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, ShieldCheck } from 'lucide-react';

const presetValues = [50, 100, 200, 350];
const pixKey = '+55 (11) 99999-9999';

export function PixGiftDialog() {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | 'custom'>(100);
  const [customValue, setCustomValue] = useState('180');
  const [copied, setCopied] = useState(false);

  const amount = useMemo(() => {
    if (selectedValue === 'custom') return Number(customValue) || null;
    return selectedValue;
  }, [selectedValue, customValue]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore error silently
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glass" size="lg" className="w-full justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Mandar mimo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border border-white/15 bg-[var(--surface-card)]/95 text-[hsl(var(--text-900))] shadow-soft backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[hsl(var(--text-900))]">Mandar mimo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-[hsla(var(--text-900),_0.8)]">
            Escolha o valor que mais combina com você. Após confirmar, uso a chave abaixo (Pix telefone) e me chama no VIP para liberar o recibo exclusivo.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {presetValues.map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedValue(value)}
                className="rounded-2xl border border-white/20 bg-white/70 p-4 text-left transition hover:border-white/40 data-[selected=true]:border-[var(--cta-green)] data-[selected=true]:shadow-glow"
                data-selected={selectedValue === value}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-700))]">Sugestão</p>
                <p className="text-2xl font-semibold text-[hsl(var(--text-900))]">R$ {value}</p>
                <p className="text-sm text-[hsla(var(--text-900),_0.7)]">Perfeito para desbloquear packs surpresa</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedValue('custom')}
              className="rounded-2xl border border-dashed border-white/30 p-4 text-left transition hover:border-white/50 data-[selected=true]:border-[var(--cta-green)]"
              data-selected={selectedValue === 'custom'}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-700))]">Personalizado</p>
              <p className="text-sm text-[hsla(var(--text-900),_0.7)]">Digite um valor acima de R$ 30</p>
              {selectedValue === 'custom' && (
                <Input
                  type="number"
                  min={30}
                  value={customValue}
                  onChange={event => setCustomValue(event.target.value)}
                  className="mt-2 bg-white/80 text-[hsl(var(--text-900))]"
                />
              )}
            </button>
          </div>

          <div className="rounded-3xl border border-white/20 bg-black/70 p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pix telefone</p>
                <p className="text-xl font-semibold">{pixKey}</p>
              </div>
              <Button variant="glass" size="icon" onClick={handleCopy} aria-label="Copiar chave PIX">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-white/70">Enviar o comprovante no Telegram para liberar o mimo na hora.</p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 text-sm text-[hsl(var(--text-900))]">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4 text-[#2FCF7F]" />
              Segurança e sigilo
            </div>
            <p>
              O valor escolhido ({amount ? `R$ ${amount}` : '—'}) fica visível apenas para nós. Nenhum dado sensível é salvo no site. Após o envio, você recebe
              um pack bônus 4K com 24h de exclusividade.
            </p>
            {copied && <Badge variant="glass" className="w-fit text-xs uppercase tracking-[0.3em]">Pix copiado</Badge>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

