import { StoreProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { POS } from './components/POS';
import { Sales } from './components/Sales';
import { Clients } from './components/Clients';
import { Settings } from './components/Settings';

function AppContent() {
  const { currentPage, loading, t } = useStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    products: <Products />,
    pos: <POS />,
    sales: <Sales />,
    clients: <Clients />,
    settings: <Settings />,
  };

  return <Layout>{pages[currentPage]}</Layout>;
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
