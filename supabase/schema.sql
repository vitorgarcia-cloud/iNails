-- ==============================================================================
-- NAILFLOW - SCHEMA DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Todas as tabelas contam com Row Level Security (RLS) habilitado.
-- ==============================================================================

-- 1. TABELA: profiles (Perfil da profissional / estúdio)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT '',
    nome_estudio TEXT DEFAULT '',
    telefone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA: clientes (CRM e histórico)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA: servicos_base (Catálogo de serviços e regras de manutenção)
CREATE TABLE IF NOT EXISTS public.servicos_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    intervalo_dias_manutencao INTEGER NOT NULL DEFAULT 21,
    valor_padrao NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA: agendamentos (Agenda e Recorrência)
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

-- 5. TABELA: despesas_insumos (Custos fixos e controle de estoque de insumos)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_servicos_user_id ON public.servicos_base(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_data ON public.agendamentos(user_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON public.agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_despesas_user_tipo ON public.despesas_insumos(user_id, tipo);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_insumos ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuários gerenciam apenas seu próprio profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para Clientes
CREATE POLICY "Usuários gerenciam apenas seus próprios clientes"
    ON public.clientes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para Serviços
CREATE POLICY "Usuários gerenciam apenas seus próprios serviços"
    ON public.servicos_base FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para Agendamentos
CREATE POLICY "Usuários gerenciam apenas seus próprios agendamentos"
    ON public.agendamentos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para Despesas e Insumos
CREATE POLICY "Usuários gerenciam apenas suas próprias despesas e insumos"
    ON public.despesas_insumos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER: Criar perfil automaticamente no cadastro do Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, nome_estudio)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'nome_estudio', 'Studio ' || split_part(NEW.email, '@', 1))
    );

    -- Inserir serviços base padrão para a nova profissional
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
