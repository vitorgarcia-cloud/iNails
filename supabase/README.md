# Configuração do Supabase para o NailFlow

Siga os passos abaixo para configurar o banco de dados do **NailFlow**:

1. Acesse o [Supabase](https://supabase.com) e crie um novo projeto (ou utilize um existente).
2. No menu lateral esquerdo, vá em **SQL Editor**.
3. Clique em **New query**.
4. Copie todo o conteúdo do arquivo [`schema.sql`](./schema.sql) e cole no editor.
5. Clique no botão **Run** (Executar).
6. Todas as tabelas, políticas de RLS e o trigger de criação automática de perfil com serviços padrões serão criados.
7. Acesse **Project Settings** -> **API**:
   - Copie o **Project URL** para `VITE_SUPABASE_URL` no seu arquivo `.env`.
   - Copie a chave **anon public** para `VITE_SUPABASE_ANON_KEY` no seu arquivo `.env`.
8. Pronto! Sua aplicação está 100% pronta para autenticar, agendar e persistir dados.
