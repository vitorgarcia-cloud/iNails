<<<<<<< HEAD
# iNails
Projeto desenvolvido para manicures gerenciarem seu negocio de maneira simples e eficiente. Sem complicações.
=======
# 💅 NailFlow - Sistema de Gestão para Nail Designers & Manicures

O **NailFlow** é uma Progressive Web App (PWA) moderna, mobile-first e de alta performance, desenvolvida sob medida para nail designers e manicures administrarem seus agendamentos, ciclos de manutenção recorrente, controle de clientes (CRM), gestão de insumos/estoque e régua de confirmações via WhatsApp (D-1).

---

## 📱 Destaques & Diferenciais

1. **Mobile-First & PWA**: Projetado especificamente para uso em smartphones durante os atendimentos em mesa. Possui botões táteis largos (touch-friendly), barra de navegação inferior (Bottom Navigation Tabs) e suporte a instalação como aplicativo na tela inicial do celular (`manifest.json` e Service Workers).
2. **Agenda com Recorrência Inteligente**: Ao agendar procedimentos com ciclos (como Alongamento ou Manutenção em Fibra de Vidro a cada 21 dias), o sistema gera automaticamente as projeções dos próximos meses na grade de horários.
3. **Balanço Mensal (Dashboard Financeiro)**: Acompanhamento de faturamento bruto, custos totais, margem líquida e volume de atendimentos com filtro dinâmico de mês/ano.
4. **CRM de Clientes & LTV**: Métricas de faturamento acumulado por cliente (Lifetime Value - LTV), histórico de procedimentos e identificação visual de clientes em risco de evasão (> 30 dias sem visita).
5. **Controle de Frascos & Estoque**: Gestão em tempo real de frascos em uso vs frascos em reserva com alerta visual imediato para itens com reserva $\le 1$.
6. **Central de Confirmações WhatsApp (D-1)**: Automação que filtra horários de amanhã pendentes e abre conversas diretas no WhatsApp com mensagens personalizadas contendo data, horário, serviço e opções de resposta.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + Vite 6
- **Roteamento**: React Router DOM v7
- **Estilização**: Tailwind CSS com tema personalizado em tons rosé/slate
- **Ícones**: Lucide React
- **Datas & Cálculos**: `date-fns` em português (`pt-BR`)
- **Backend & Banco de Dados**: Supabase (PostgreSQL com Row Level Security - RLS)
- **PWA**: `vite-plugin-pwa`

---

## 📂 Arquitetura de Pastas

```text
/Nails-Manager
├── public/                 # Manifest PWA e ícones
├── supabase/
│   ├── schema.sql          # Script SQL completo com RLS e triggers
│   └── README.md           # Guia de configuração do banco de dados
├── src/
│   ├── config/             # Configuração e inicialização do cliente Supabase
│   ├── contexts/           # AuthContext (sessão) e ToastContext (notificações)
│   ├── hooks/              # Custom hooks (useAuth, useClientes, useAgendamentos, etc.)
│   ├── services/           # Regras de acesso a dados e chamadas à API
│   │   ├── authService.js
│   │   ├── clientesService.js
│   │   ├── servicosService.js
│   │   ├── agendamentosService.js
│   │   └── despesasService.js
│   ├── utils/              # Formatadores (moeda, datas, telefone) e gerador WhatsApp
│   ├── components/
│   │   ├── ui/             # Componentes base: Button, Input, Select, Card, Modal, Tabs, Badge
│   │   ├── layout/         # Header, BottomNav e AppLayout
│   │   ├── common/         # ProtectedRoute, EmptyState, LoadingSpinner
│   │   ├── dashboard/      # KpiCard, MonthFilter
│   │   ├── agenda/         # AgendamentoCard, NovoAgendamentoModal
│   │   ├── clientes/       # ClienteCard, NovoClienteModal
│   │   └── estoque/        # InsumoCard, DespesaModal
│   ├── pages/
│   │   ├── Auth/           # LoginPage (Login / Cadastro)
│   │   ├── Dashboard/      # DashboardPage (Balanço Mensal)
│   │   ├── Agenda/         # AgendaPage (Agenda & Recorrência)
│   │   ├── Clientes/       # ClientesPage e ClienteDetalhesPage (CRM & LTV)
│   │   ├── CustosEstoque/  # CustosEstoquePage (Fixas & Insumos)
│   │   └── Confirmacoes/   # ConfirmacoesPage (Central D-1 WhatsApp)
│   ├── App.jsx             # Definição das rotas e provedores
│   ├── main.jsx            # Ponto de entrada React
│   └── index.css           # Tailwind e utilitários de safe-area mobile
└── package.json
```

---

## 🚀 Como Executar o Projeto

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar o Supabase (Opcional para teste imediato)
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Preencha com a URL e chave anônima do seu projeto Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

> **Nota:** Se você não configurar o `.env`, o NailFlow entra automaticamente em **Modo Demonstração**, com dados mockados de exemplo prontos para navegar, testar a régua de confirmação e cadastrar registros localmente!

### 3. Executar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador ou emule um celular em `http://localhost:3000`.

### 4. Build de Produção
```bash
npm run build
```
>>>>>>> 88def4e2 (first commit inails)
