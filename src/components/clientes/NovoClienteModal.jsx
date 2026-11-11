import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { User, Phone, Calendar, FileText } from 'lucide-react';

/**
 * Modal de cadastro e edição de cliente.
 * Se a prop `cliente` for informada, o modal abre em modo de edição com os dados preenchidos.
 */
export function NovoClienteModal({ isOpen, onClose, onSalvar, cliente = null }) {
  const isEdicao = Boolean(cliente);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNome(cliente?.nome || '');
      setTelefone(cliente?.telefone || '');
      setDataNascimento(cliente?.data_nascimento || '');
      setObservacoes(cliente?.observacoes || '');
    }
  }, [isOpen, cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      alert('Nome e telefone são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { error } = (await onSalvar({
        nome: nome.trim(),
        telefone: telefone.trim(),
        data_nascimento: dataNascimento || null,
        observacoes: observacoes.trim(),
      })) || {};
      if (!error) onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdicao ? 'Editar Cliente' : 'Nova Cliente'}
      description={
        isEdicao
          ? 'Atualize os dados de contato e preferências da cliente'
          : 'Cadastre os dados de contato e preferências da cliente'
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome Completo *"
          placeholder="Ex: Beatriz Ferreira"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          icon={User}
          required
        />

        <Input
          label="WhatsApp (com DDD) *"
          placeholder="Ex: 11987654321"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          icon={Phone}
          required
        />

        <Input
          label="Data de Nascimento"
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          icon={Calendar}
        />

        <Input
          label="Observações / Preferências"
          placeholder="Ex: Prefere formato amendoado, cutícula sensível"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          icon={FileText}
        />

        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" fullWidth onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" fullWidth type="submit" loading={loading}>
            {isEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NovoClienteModal;
