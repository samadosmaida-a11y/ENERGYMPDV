import type { ReactNode } from 'react';
import { useStore } from '../store';
import { LayoutDashboard, Package, ShoppingCart, Receipt, Users, Settings as SettingsIcon, Leaf } from 'lucide-react';
import type { Page } from '../types';

const navItems: { key: Page; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'products', icon: Package },
  { key: 'pos', icon: ShoppingCart },
  { key: 'sales', icon: Receipt },
  { key: 'clients', icon: Users },
  { key: 'settings', icon: SettingsIcon },
];

export function Layout({ children }: { children: ReactNode }) {
  const { currentPage, setPage, t, settings } = useStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{t.appTitle}</h1>
            <p className="text-xs text-slate-400">{t.appSubtitle}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === key
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {t.nav[key]}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">{settings.shop_name}</p>
          <p className="text-xs text-slate-300 mt-1">v2026.10</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">{t.appTitle}</span>
          </div>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {navItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                currentPage === key
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.nav[key]}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-[100px] md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in" key={currentPage}>
          {children}
        </div>
      </main>
    </div>
  );
}
