import React from 'react';

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex bg-slate-100 p-1 rounded-xl gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold
              transition-all duration-150 select-none
              ${
                isActive
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
              }
            `}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
