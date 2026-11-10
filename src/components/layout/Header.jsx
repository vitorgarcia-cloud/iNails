import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, LogOut, Database, ChevronDown, Store, Calendar } from 'lucide-react';

export function Header() {
  const { profile, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Nome do Estúdio */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">iNails</span>
              {isDemo && (
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Demo
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[170px]">
              {profile?.nome_estudio || 'Meu Estúdio'}
            </span>
          </div>
        </Link>

        {/* Perfil & Ações */}
        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            {profile?.foto_url ? (
              <img
                src={profile.foto_url}
                alt={profile?.nome || 'Perfil'}
                className="w-8 h-8 rounded-full object-cover border border-brand-300 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'N'}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu Mobile */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{profile?.nome || 'Nail Designer'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profile?.nome_estudio}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/perfil');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors text-left"
                  >
                    <Store className="w-4 h-4 text-brand-500" />
                    <span>Perfil & Estúdio</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/agenda');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors text-left"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Ver Agenda Completa</span>
                  </button>

                  <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {isDemo ? 'Modo Demonstração' : 'Banco de Dados Conectado'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
