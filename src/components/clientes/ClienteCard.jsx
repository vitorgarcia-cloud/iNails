import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { formatTelefone } from '../../utils/formatters';
import { normalizarTelefoneWhatsApp } from '../../utils/whatsapp';
import { Phone, MessageCircle, Edit2, Trash2 } from 'lucide-react';

export function ClienteCard({ cliente, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!cliente.telefone) return;
    const phone = normalizarTelefoneWhatsApp(cliente.telefone);
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/clientes/${cliente.id}`)}
      className="flex items-center justify-between gap-3"
      padding="p-3.5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {cliente.nome ? cliente.nome.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">{cliente.nome}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{formatTelefone(cliente.telefone)}</span>
          </p>
          {cliente.observacoes && (
            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
              {cliente.observacoes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {cliente.telefone && (
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
            title="Conversar no WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cliente);
            }}
            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
            title="Editar cliente"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cliente);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
            title="Excluir cliente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

export default ClienteCard;
