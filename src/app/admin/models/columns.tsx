"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabaseClient"
import { Model } from "@/types"; // Importa o tipo centralizado

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Componente para a ação de exclusão
function DeleteAction({ model, onDelete }: { model: Model, onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("models").delete().eq("id", model.id);
      if (error) throw error;
      toast({ title: "Modelo excluído com sucesso!" });
      onDelete(); // Chama o callback para atualizar a UI
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500 hover:bg-red-500/10 w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o modelo "{model.nome}" e todas as mídias associadas a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Sim, excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// A função que gera as colunas agora aceita um callback
export const getColumns = (onModelDeleted: () => void): ColumnDef<Model>[] => [
  {
    accessorKey: "avatar_url",
    header: "Avatar",
    cell: ({ row }) => {
      const avatarUrl = row.getValue("avatar_url") as string | null
      return (
        <div className="w-12 h-12">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-700 rounded-full" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "bio",
    header: "Bio",
    cell: ({ row }) => {
        const bio = row.getValue("bio") as string
        return <div className="text-sm text-white/70 max-w-xs truncate">{bio}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href={`/admin/models/${model.id}`}>Editar Modelo</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/admin/models/${model.id}/media`}>Gerenciar Mídia</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteAction model={model} onDelete={onModelDeleted} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
