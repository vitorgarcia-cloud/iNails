-- ==============================================================================
-- iNails - SCHEMA DO BANCO DE DADOS POSTGRESQL (SUPABASE)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Ele cria todas as tabelas, índices de alta performance, políticas RLS de segurança
-- e a automação (trigger) que cadastra o perfil e serviços base assim que a
-- usuária cria a conta no Supabase Auth.
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELA: profiles (Perfil da manicure / estúdio e configurações operacionais)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT '',
    nome_estudio TEXT DEFAULT 'Meu Estúdio',
    telefone TEXT DEFAULT '',
    foto_url TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    chave_pix TEXT DEFAULT '',
    tipo_chave_pix TEXT DEFAULT 'celular',
    dias_trabalho INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6], -- 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    horario_inicio TEXT DEFAULT '08:00',
    horario_fim TEXT DEFAULT '19:00',
    intervalo_padrao_dias INTEGER DEFAULT 21,
    mensagem_whatsapp TEXT DEFAULT 'Olá {cliente}! ✨ Passando para confirmar seu horário no {estudio} para {servico} no dia {data} às {hora}. Podemos confirmar? 💅',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir colunas adicionais caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foto_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS endereco TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chave_pix TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_chave_pix TEXT DEFAULT 'celular';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dias_trabalho INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS horario_inicio TEXT DEFAULT '08:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS horario_fim TEXT DEFAULT '19:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intervalo_padrao_dias INTEGER DEFAULT 21;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mensagem_whatsapp TEXT DEFAULT 'Olá {cliente}! ✨ Passando para confirmar seu horário no {estudio} para {servico} no dia {data} às {hora}. Podemos confirmar? 💅';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ==============================================================================
-- 3. TABELA: clientes (CRM e histórico de clientes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TABELA: servicos_base (Catálogo de serviços e regras de ciclo de manutenção)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.servicos_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    intervalo_dias_manutencao INTEGER NOT NULL DEFAULT 21,
    valor_padrao NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. TABELA: agendamentos (Agenda, recorrência e status de ciclos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES public.servicos_base(id) ON DELETE SET NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado')),
    observacao TEXT,
    is_recorrente BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABELA: despesas_insumos (Custos fixos e controle de estoque de insumos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.despesas_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('fixa', 'insumo')),
    nome TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    data_vencimento DATE,
    status_pagamento TEXT NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pago', 'pendente')),
    qtd_uso INTEGER NOT NULL DEFAULT 0,
    qtd_reserva INTEGER NOT NULL DEFAULT 0,
    qtd_minima_alerta INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna de alerta caso tabela já exista
ALTER TABLE public.despesas_insumos ADD COLUMN IF NOT EXISTS qtd_minima_alerta INTEGER NOT NULL DEFAULT 1;

-- ==============================================================================
-- 7. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(user_id, nome);
CREATE INDEX IF NOT EXISTS idx_servicos_user_id ON public.servicos_base(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_data ON public.agendamentos(user_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON public.agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_despesas_user_tipo ON public.despesas_insumos(user_id, tipo);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - SEGURANÇA E ISOLAMENTO MULTI-TENANT
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_insumos ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores para evitar duplicatas em re-execução
DROP POLICY IF EXISTS "Usuários gerenciam apenas seu próprio profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários gerenciam apenas seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários gerenciam apenas seus próprios serviços" ON public.servicos_base;
DROP POLICY IF EXISTS "Usuários gerenciam apenas seus próprios agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas próprias despesas e insumos" ON public.despesas_insumos;

-- Criação das políticas RLS (CRUD completo isolado por user_id autenticado)
CREATE POLICY "Usuários gerenciam apenas seu próprio profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam apenas seus próprios clientes"
    ON public.clientes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam apenas seus próprios serviços"
    ON public.servicos_base FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam apenas seus próprios agendamentos"
    ON public.agendamentos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam apenas suas próprias despesas e insumos"
    ON public.despesas_insumos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 9. AUTOMAÇÃO (TRIGGER): Criar perfil e serviços padrão no cadastro (Auth)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    nome_usuario TEXT;
    estudio_usuario TEXT;
BEGIN
    nome_usuario := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
    estudio_usuario := COALESCE(NEW.raw_user_meta_data->>'nome_estudio', 'Studio ' || nome_usuario);

    -- Insere o perfil padrão da profissional
    INSERT INTO public.profiles (user_id, nome, nome_estudio)
    VALUES (NEW.id, nome_usuario, estudio_usuario)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insere o catálogo de serviços essenciais padrão para a nova profissional
    INSERT INTO public.servicos_base (user_id, nome, intervalo_dias_manutencao, valor_padrao)
    VALUES
        (NEW.id, 'Alongamento Fibra de Vidro', 21, 150.00),
        (NEW.id, 'Manutenção Fibra de Vidro', 21, 95.00),
        (NEW.id, 'Esmaltação em Gel', 15, 60.00),
        (NEW.id, 'Banho de Gel', 21, 80.00),
        (NEW.id, 'Manicure Tradicional', 7, 35.00);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
