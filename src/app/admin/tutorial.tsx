export default function AdminTutorialPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow mt-6 prose">
      <h1>Tutorial Rápido de Utilização do Painel Admin</h1>
      <h2>1. Configurar o Supabase do zero</h2>
      <ol>
        <li>Acesse <a href="https://app.supabase.com" target="_blank" rel="noopener">https://app.supabase.com</a> e crie uma conta gratuita.</li>
        <li>Clique em “New Project” e crie um projeto indicando nome e senha.</li>
        <li>No menu “Table Editor”, crie as tabelas:<ul>
          <li><b>models</b>: uuid (PK), nome (text), bio (text), avatar_url (text), banner_url (text), redes (text), views (integer default 0)</li>
          <li><b>media</b>: uuid (PK), modelo_id (uuid), url (text), tipo (text), descricao (text), publicar_em (timestamp)</li>
          <li><b>banners</b>: uuid (PK), url (text), tipo (text), titulo (text), link (text), ordem (int), ativo (bool)</li></ul></li>
        <li>No menu “Authentication > Policies”, habilite 'Email' e cadastre os usuários admin.</li>
      </ol>
      <h2>2. Copie as credenciais públicas do Supabase:</h2>
      <ol>
        <li>Vá em “Settings &rarr; API”.</li>
        <li>Copie o valor de <b>Project URL (e.g., https://xxxx.supabase.co)</b> e <b>anon public key</b>.</li>
        <li>No admin, acesse <b>/admin/config</b> e cole suas credenciais.</li>
      </ol>
      <h2>3. Cadastro de modelos: </h2>
      <p>Acesse <b>/admin/models</b> e clique em “Adicionar Modelo”. Preencha nome, bio, avatares, banners e links sociais. Salve.</p>
      <h2>4. Upload/agendamento de mídias:</h2>
      <p>Entre na aba de mídias do modelo e suba fotos/vídeos. Use o campo <b>"Agendar para"</b> para definir quando cada conteúdo deverá aparecer publicamente.</p>
      <h2>5. Uso e gestão de banners/destaques:</h2>
      <ul>
        <li>Entre em <b>/admin/banners</b> para adicionar banners de destaque na home (upload imagem/vídeo, definir ordem, ativar/inativar).</li>
      </ul>
      <h2>6. Como apagar mídias de forma segura:</h2>
      <ol>
        <li>Use a busca/filtro de mídia na página de mídia de uma modelo ou no buscador global.</li>
        <li>Clique em “Excluir” ao lado da mídia, confirme no modal de segurança.</li>
        <li>Banners podem ser removidos editando a lista de banners.</li>
      </ol>
      <h2>Dicas de Segurança</h2>
      <ul>
        <li>Mantenha seu <b>anon key</b> em segurança. Nunca exponha <b>service_role key</b> publicamente.</li>
        <li>Troque as credenciais no painel admin quando necessário.</li>
        <li>Use senhas fortes nos usuários admin.</li>
      </ul>
      <h2>Restore Rápido</h2>
      <ul>
        <li>Se perder acesso ao banco ou storage do Supabase, basta apontar novas credenciais em /admin/config.</li>
        <li>Dados, imagens e vídeos podem ser migrados exportando pelo painel do Supabase.</li>
      </ul>
    </div>
  );
}
