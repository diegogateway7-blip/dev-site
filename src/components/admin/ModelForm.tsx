"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import Image from "next/image";

// Imports para o formulário
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Imports de componentes shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define o esquema de validação com Zod
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  bio: z.string().min(10, { message: "A bio deve ter pelo menos 10 caracteres." }),
  slug: z.string().min(2, { message: "O slug deve ter pelo menos 2 caracteres." }).regex(/^[a-z0-9-]+$/, { message: "Use apenas letras minúsculas, números e hífens." }).optional(),
  redes: z.string().optional(),
});

interface ModelFormProps {
  modelId?: string;
}

export default function ModelForm({ modelId }: ModelFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!modelId;

  // ESTADOS REINTRODUZIDOS para controle de UI
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // Renomeado para não conflitar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Configuração do React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      bio: "",
      slug: "",
      redes: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      async function fetchModel() {
        setLoading(true);
        try {
          const supabase = createClient();
          const { data, error } = await supabase.from("models").select("*").eq("id", modelId).single();
          if (error) throw error;
          // Popula o formulário com os dados existentes
          form.reset({
            nome: data.nome ?? "",
            bio: data.bio ?? "",
            slug: data.slug ?? "",
            redes: data.redes ?? "",
          });
          setExistingAvatarUrl(data.avatar_url);
          setExistingBannerUrl(data.banner_url);
          setSlugEdited(!!data.slug);
        } catch (e: any) {
          setFormError(e?.message || "Modelo não encontrado");
        } finally {
          setLoading(false);
        }
      }
      fetchModel();
    }
  }, [modelId, form, isEditMode]);

  // Função para upload de um arquivo
  async function uploadFile(file: File, name: string): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("models").upload(`${name}_${Date.now()}_${file.name}`, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
  }

  // Nova função de submit, integrada com o React Hook Form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setFormError(null);

    try {
      const supabase = createClient();
      let avatar_url = existingAvatarUrl;
      let banner_url = existingBannerUrl;

      if (avatarFile) {
        avatar_url = await uploadFile(avatarFile, "avatar");
      }
      if (bannerFile) {
        banner_url = await uploadFile(bannerFile, "banner");
      }

      const slugValue = values.slug && values.slug.length > 0 ? values.slug : slugify(values.nome);
      const finalData = { ...values, slug: slugValue, avatar_url, banner_url };

      const { error } = isEditMode
        ? await supabase.from("models").update(finalData).eq("id", modelId)
        : await supabase.from("models").insert([finalData]);

      if (error) throw error;

      toast({ title: `Modelo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!` });
      router.push("/admin/models");
      router.refresh();

    } catch (e: any) {
      setFormError(`Erro ao salvar: ${e?.message || ""}`);
    } finally {
      setLoading(false);
    }
  }
  
  // Função para deletar
  async function handleDelete() {
    if (!modelId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("models").delete().eq("id", modelId);
      if (error) throw error;
      toast({ title: "Modelo excluído com sucesso!" });
      router.push("/admin/models");
      router.refresh();
    } catch (e: any) {
      toast({ title: "Erro ao excluir!", description: e.message, variant: "destructive" });
    } finally {
        setLoading(false);
        setShowDeleteModal(false);
    }
  }

  if (loading && isEditMode && !form.getValues("nome")) {
    return (
      <Card className="max-w-xl mx-auto mt-6">
          <CardHeader><CardTitle>Carregando Dados...</CardTitle></CardHeader>
          <CardContent><div className="space-y-4"><div className="h-10 bg-gray-200 rounded animate-pulse"></div><div className="h-24 bg-gray-200 rounded animate-pulse"></div></div></CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl mx-auto mt-6 border border-white/10 bg-[color:var(--surface-card)] shadow-soft backdrop-blur-3xl">
      <CardHeader>
        <CardTitle>{isEditMode ? "Editar Modelo" : "Nova Modelo"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            {formError && <div className="text-red-500 text-sm text-center p-3 bg-red-500/10 rounded-md">{formError}</div>}
            
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do modelo"
                      {...field}
                      onChange={(event) => {
                        if (!slugEdited) {
                          form.setValue("slug", slugify(event.target.value));
                        }
                        field.onChange(event);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL pública)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: larissa-santos"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        setSlugEdited(true);
                        field.onChange(event);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-white/70">A página ficará disponível em /modelos/{field.value || "slug"}.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o modelo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
              {existingAvatarUrl && <Image src={existingAvatarUrl} alt="avatar" width={96} height={96} className="w-24 h-24 mt-2 object-cover rounded-full" />}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="banner">Capa</Label>
              <Input id="banner" type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} />
              {existingBannerUrl && <Image src={existingBannerUrl} alt="banner" width={192} height={80} className="w-48 h-20 mt-2 object-cover rounded" />}
            </div>

            <FormField
              control={form.control}
              name="redes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redes Sociais</FormLabel>
                  <FormControl>
                    <Input placeholder="@instagram, @twitter, ..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {isEditMode && (
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={loading}>Excluir</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Exclusão</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                      <Button onClick={handleDelete} variant="destructive" disabled={loading}>Excluir</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <Button type="submit" disabled={loading} variant="cta">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
