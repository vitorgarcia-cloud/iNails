# Configuração do Banco de Dados Supabase (PostgreSQL) - iNails

Siga o passo a passo abaixo para conectar o **iNails** ao seu banco de dados no **Supabase**:

---

## 1. Criar o Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Clique em **New project**, escolha a organização e dê um nome (ex.: `inails-db`).
3. Defina uma senha forte para o banco e selecione a região mais próxima (ex.: `South America (São Paulo)`).

---

## 2. Executar o Script SQL
1. No menu lateral esquerdo do Supabase, clique em **SQL Editor** (ícone de terminal).
2. Clique em **New query**.
3. Copie todo o conteúdo do arquivo [`schema.sql`](./schema.sql) e cole no editor.
4. Clique em **Run** (ou pressione `Ctrl + Enter` / `Cmd + Enter`).
5. O Supabase criará automaticamente:
   - As 5 tabelas do sistema (`profiles`, `clientes`, `servicos_base`, `agendamentos`, `despesas_insumos`);
   - Índices otimizados para busca rápida de clientes, datas e status;
   - Políticas de **Row Level Security (RLS)** que isolam 100% os dados de cada manicure/usuária autenticada;
   - Automação (`trigger`) que já cria o perfil e cadastra os 5 serviços padrão (Alongamento, Manutenção, Esmaltação em Gel, Banho de Gel, Tradicional) assim que uma usuária se cadastra.

---

## 3. Obter as Chaves de API
1. No menu lateral do Supabase, clique em **Project Settings** (ícone de engrenagem no rodapé) -> **API**.
2. Na seção **Project API keys**, copie:
   - **Project URL** -> `VITE_SUPABASE_URL`
   - **anon public** -> `VITE_SUPABASE_ANON_KEY`

---

## 4. Configurar na Vercel (Produção)
Ao fazer o deploy na Vercel:
1. No dashboard do seu projeto na Vercel, acesse **Settings** -> **Environment Variables**.
2. Adicione as duas variáveis:
   - **Key:** `VITE_SUPABASE_URL` | **Value:** `https://seu-projeto.supabase.co`
   - **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** `sua-chave-anon-publica`
3. Marque os ambientes **Production**, **Preview** e **Development**.
4. Salve e faça o Redeply se necessário.

---

## 5. Configurar Localmente (Desenvolvimento)
1. Crie um arquivo `.env` na raiz do projeto (copiando do `.env.example`).
2. Preencha com as suas chaves:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
3. Reinicie o servidor de desenvolvimento (`npm run dev`).
