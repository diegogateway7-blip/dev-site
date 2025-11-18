// src/types/index.ts

/**
 * Representa a estrutura de dados para um Modelo na plataforma.
 */
export type Model = {
  id: number;
  nome: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  redes?: string | null;
  slug?: string | null;
};

export type Banner = {
  id: string;
  created_at: string;
  titulo: string;
  tipo: 'image' | 'video';
  url: string | null;
  link?: string | null;
  ordem: number;
  ativo: boolean;
};

/**
 * Representa a estrutura de dados para uma Mídia.
 */
export type Media = {
  id: number;
  created_at: string;
  modelo_id: number;
  url: string;
  tipo: 'photo' | 'video';
  descricao: string | null;
  publicar_em?: string | null;
  models?: { // Relação opcional que pode vir do Supabase
    nome: string;
  };
};
