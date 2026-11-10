import React, { useState } from 'react';
import { useClientes } from '../../hooks/useClientes';
import ClienteCard from '../../components/clientes/ClienteCard';
import NovoClienteModal from '../../components/clientes/NovoClienteModal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Plus, Users } from 'lucide-react';

export function ClientesPage() {
  const { clientes, carregando, adicionarCliente } = useClientes();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Filtro por nome ou telefone
  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    const nomeMatch = c.nome?.toLowerCase().includes(termo);
    const telMatch = c.telefone?.includes(termo);
    return nomeMatch || telMatch;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Topo com Título e Botão Nova Cliente */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Clientes (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {clientes.length} {clientes.length === 1 ? 'cliente cadastrada' : 'clientes cadastradas'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalAberto(true)}
          icon={Plus}
        >
          Nova
        </Button>
      </div>

      {/* Barra de Pesquisa */}
      <Input
        placeholder="Buscar por nome ou telefone..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        icon={Search}
      />

      {/* Lista de Clientes */}
      {carregando ? (
        <LoadingSpinner text="Buscando clientes..." />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState
          icon={Users}
          title={busca ? 'Nenhuma cliente encontrada' : 'Nenhuma cliente cadastrada ainda'}
          description={
            busca
              ? `Nenhum resultado para "${busca}". Tente outro termo.`
              : 'Cadastre suas clientes para acompanhar ciclos e histórico.'
          }
          actionLabel={busca ? 'Limpar Busca' : 'Cadastrar Primeira Cliente'}
          onAction={busca ? () => setBusca('') : () => setModalAberto(true)}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}

      {/* Modal de Cadastro de Cliente */}
      <NovoClienteModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={adicionarCliente}
      />
    </div>
  );
}

export default ClientesPage;
