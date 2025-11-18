# Roxo Premium Visual Kit - Painel de Administração

Este é o painel de administração para o projeto Roxo Premium Visual Kit. Construído com Next.js, TypeScript, Supabase e Tailwind CSS, ele permite o gerenciamento de modelos, mídias e configurações do site principal.

## ✨ Funcionalidades

- **Dashboard:** Visualização rápida de métricas e estatísticas.
- **Gerenciamento de Modelos:** Crie, edite e exclua perfis de modelos.
- **Upload de Mídia:** Faça o upload de avatares, banners e outras mídias.
- **Autenticação Segura:** Sistema de login protegido para administradores.
- **Interface Moderna:** Construída com shadcn/ui para uma experiência de usuário consistente e responsiva.

---

## 🚀 Começando

Siga estas instruções para configurar e rodar o projeto em seu ambiente de desenvolvimento local.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou um gerenciador de pacotes compatível

### 2. Configuração do Ambiente

Primeiro, clone o repositório para a sua máquina:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd dev-site
```

Em seguida, instale as dependências do projeto:

```bash
npm install
```

### 3. Variáveis de Ambiente

Você precisará de um projeto Supabase para conectar ao banco de dados e ao sistema de storage.

1.  Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env.local`:

    ```bash
    cp .env.example .env.local
    ```

2.  Abra o arquivo `.env.local` e preencha as variáveis com as suas chaves do Supabase, que você pode encontrar no painel do seu projeto em **Settings > API**:

    ```env
    NEXT_PUBLIC_SUPABASE_URL="SUA_URL_DO_SUPABASE"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_ANON_KEY_DO_SUPABASE"
    ```

### 4. Rodando o Servidor de Desenvolvimento

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) (ou a porta que aparecer no seu terminal) no seu navegador para ver a aplicação.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Formulários:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
