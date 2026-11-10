import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  MessageCircle
} from 'lucide-react';

export function BottomNav() {
  const navItems = [
    {
      to: '/',
      label: 'Balanço',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/agenda',
      label: 'Agenda',
      icon: Calendar,
    },
    {
      to: '/clientes',
      label: 'Clientes',
      icon: Users,
    },
    {
      to: '/custos-estoque',
      label: 'Custos',
      icon: Package,
    },
    {
      to: '/confirmacoes',
      label: 'Confirmar',
      icon: MessageCircle,
      hasBadge: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-nav pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 h-full py-1 relative select-none
                transition-all duration-150 active:scale-95
                ${isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.hasBadge && (
                      <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-ping" />
                    )}
                    {item.hasBadge && (
                      <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 leading-tight tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-5 h-1 bg-brand-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
