import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MonthFilter({ currentDate, onChange }) {
  const handlePrevMonth = () => {
    onChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(currentDate, 1));
  };

  const formattedMonth = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  // Capitaliza primeira letra
  const displayTitle = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-soft p-2 px-3">
      <button
        onClick={handlePrevMonth}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-brand-500" />
        <span className="text-sm font-bold text-slate-800">{displayTitle}</span>
      </div>

      <button
        onClick={handleNextMonth}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default MonthFilter;
