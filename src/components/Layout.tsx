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
  const isRTL = settings.language === 'ar';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-full border-r" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, var(--c-400), var(--c-600))' }}>
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{t.appTitle}</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.appSubtitle}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={
                currentPage === key
                  ? { backgroundColor: 'var(--c-50)', color: 'var(--c-700)' }
                  : { color: 'var(--text-secondary)' }
              }
              onMouseEnter={(e) => { if (currentPage !== key) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (currentPage !== key) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Icon className="w-5 h-5" />
              {t.nav[key]}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{settings.shop_name}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>v2026.10</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 border-b z-50" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--c-400), var(--c-600))' }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.appTitle}</span>
          </div>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {navItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={
                currentPage === key
                  ? { backgroundColor: 'var(--c-50)', color: 'var(--c-700)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon className="w-4 h-4" />
              {t.nav[key]}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-[100px] md:pt-0 min-h-screen" style={isRTL ? { marginLeft: 0, marginRight: '16rem' } : undefined}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in" key={currentPage}>
          {children}
        </div>
      </main>
    </div>
  );
}
