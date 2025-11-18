"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import * as z from "zod";

// Esquema de validação para os dados que vêm do formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  bio: z.string().min(10, { message: "A bio deve ter pelo menos 10 caracteres." }),
  slug: z.string().min(2, { message: "O slug deve ter pelo menos 2 caracteres." }).regex(/^[a-z0-9-]+$/, { message: "Use apenas letras minúsculas, números e hífens." }).optional(),
  redes: z.string().optional(),
  avatar_url: z.string().url({ message: "URL de avatar inválida." }).optional().nullable(),
  banner_url: z.string().url({ message: "URL de banner inválida." }).optional().nullable(),
});

// Tipagem para o estado de retorno da ação
export interface FormState {
  message: string;
  error: boolean;
  fields?: Record<string, string[] | undefined>;
}

// Ação do Servidor para criar ou atualizar um modelo
export async function saveModel(
  prevState: FormState,
  formData: FormData,
  modelId?: string
): Promise<FormState> {
  const isEditMode = !!modelId;

  // 1. Validação dos dados com Zod a partir do FormData
  const validatedFields = formSchema.safeParse({
    nome: formData.get("nome"),
    bio: formData.get("bio"),
    slug: formData.get("slug"),
    redes: formData.get("redes"),
    avatar_url: formData.get("avatar_url") || null,
    banner_url: formData.get("banner_url") || null,
  });

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Por favor, corrija os erros no formulário.",
      error: true,
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createServer();
  const { data: validatedData } = validatedFields;
  
  const slugValue = validatedData.slug && validatedData.slug.length > 0
    ? validatedData.slug
    : slugify(validatedData.nome);

  const finalData = {
    ...validatedData,
    slug: slugValue,
  };

  try {
    const { error } = isEditMode
      ? await supabase.from("models").update(finalData).eq("id", modelId as string)
      : await supabase.from("models").insert([finalData]);

    if (error) {
      // Adiciona log para depuração no servidor
      console.error("Supabase Error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/admin/models"); // Invalida o cache para atualizar a lista
    revalidatePath(`/modelos/${slugValue}`); // Invalida o cache da página pública do modelo

    return {
      message: `Modelo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
      error: false,
    };

  } catch (e: any) {
    return {
      message: `Erro no servidor: ${e.message}`,
      error: true,
    };
  }
}
