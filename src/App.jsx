import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Páginas da Aplicação NailFlow
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AgendaPage from './pages/Agenda/AgendaPage';
import ClientesPage from './pages/Clientes/ClientesPage';
import ClienteDetalhesPage from './pages/Clientes/ClienteDetalhesPage';
import CustosEstoquePage from './pages/CustosEstoque/CustosEstoquePage';
import ConfirmacoesPage from './pages/Confirmacoes/ConfirmacoesPage';
import PerfilPage from './pages/Perfil/PerfilPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Rota Pública de Autenticação */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Protegidas (Exigem Login e usam o Layout PWA Mobile-First) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Módulo 2: Balanço Mensal (Dashboard Principal) */}
                <Route path="/" element={<DashboardPage />} />

                {/* Módulo 4: Agenda & Recorrência Inteligente */}
                <Route path="/agenda" element={<AgendaPage />} />

                {/* Módulo 3: Clientes (CRM) */}
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/clientes/:id" element={<ClienteDetalhesPage />} />

                {/* Módulo 5: Custos e Estoque */}
                <Route path="/custos-estoque" element={<CustosEstoquePage />} />

                {/* Módulo 6: Central de Confirmações (Notificações D-1 WhatsApp) */}
                <Route path="/confirmacoes" element={<ConfirmacoesPage />} />

                {/* Módulo Perfil & Configurações do Estúdio */}
                <Route path="/perfil" element={<PerfilPage />} />
              </Route>
            </Route>

            {/* Redirecionamento Padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
