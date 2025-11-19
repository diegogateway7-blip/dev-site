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
import { saveModel } from "@/app/admin/(protected)/models/actions";

// Define o esquema de validação com Zod
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  bio: z.string().min(10, { message: "A bio deve ter pelo menos 10 caracteres." }),
  slug: z.string().min(2, { message: "O slug deve ter pelo menos 2 caracteres." }).regex(/^[a-z0-9-]+$/, { message: "Use apenas letras minúsculas, números e hífens." }).optional(),
  redes: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
});

interface ModelFormProps {
  modelId?: string;
}

export default function ModelForm({ modelId }: ModelFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!modelId;

  // ESTADOS para controle de UI
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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
      avatar_url: null,
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
          form.reset({
            nome: data.nome ?? "",
            bio: data.bio ?? "",
            slug: data.slug ?? "",
            redes: data.redes ?? "",
            avatar_url: data.avatar_url,
            banner_url: data.banner_url,
          });
          setSlugEdited(!!data.slug);
        } catch (e: any) {
          toast({ title: "Erro", description: "Modelo não encontrado", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      fetchModel();
    }
  }, [modelId, form, isEditMode, toast]);
  
    // Função para upload de um arquivo
  async function uploadFile(file: File, name: string): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("models").upload(`${name}_${Date.now()}_${file.name}`, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
  }

  // Wrapper para a Server Action
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    let avatar_url = values.avatar_url;
    let banner_url = values.banner_url;

    try {
        if (avatarFile) {
          avatar_url = await uploadFile(avatarFile, "avatar");
        }
    } catch (e: any) {
        toast({ title: "Erro de Upload", description: e.message, variant: "destructive" });
        setLoading(false);
        return;
    }

    const formData = new FormData();
    // Adiciona os valores do formulário (exceto nulos ou indefinidos)
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
          formData.append(key, value as string);
      }
    });

    // Garante que as URLs das imagens (novas ou existentes) sejam incluídas
    if (avatar_url) {
      formData.set("avatar_url", avatar_url);
    }

    const result = await saveModel({ message: "", error: false, fields: {} }, formData, modelId);

    if (result.error) {
        toast({ title: "Erro ao Salvar", description: result.message, variant: "destructive" });
        // Seta os erros dos campos no formulário
        if(result.fields) {
            for (const [field, errors] of Object.entries(result.fields)) {
                form.setError(field as keyof z.infer<typeof formSchema>, {
                    type: "manual",
                    message: errors?.join(", "),
                });
            }
        }
    } else {
        toast({ title: `Modelo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!` });
        router.push("/admin/models");
        router.refresh();
    }
    setLoading(false);
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
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="grid gap-6">
            
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
              {form.watch("avatar_url") && <Image src={form.watch("avatar_url")!} alt="avatar" width={96} height={96} className="w-24 h-24 mt-2 object-cover rounded-full" />}
            </div>

            {/* Banner/capa removed — feature disabled */}

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
