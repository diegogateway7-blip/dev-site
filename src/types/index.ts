// src/types/index.ts

/**
 * Representa a estrutura de dados para um Modelo na plataforma.
 */
export type Model = {
  id: number;
  nome: string;
  bio: string;
  avatar_url: string | null;
  banner_url?: string | null; // Adicionado banner_url para completude
  redes?: string; // Adicionado redes para completude
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
  models?: { // Relação opcional que pode vir do Supabase
    nome: string;
  };
};
