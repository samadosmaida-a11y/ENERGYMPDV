import { useStore } from '../store';
import { Package, Receipt, Users, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

function StatCard({ icon, label, value, bg }: { icon: ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { products, sales, clients, settings, t, setPage } = useStore();

  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.created_at).toDateString() === today);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= (p.min_stock || settings.low_stock_threshold));

  const recentSales = sales.slice(0, 5);
  const fmt = (n: number) => `${n.toFixed(2)} ${settings.currency}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.dashboard.welcome}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t.dashboard.welcomeMsg}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-5 h-5" style={{ color: 'var(--c-600)' }} />} label={t.dashboard.totalProducts} value={String(products.length)} bg="var(--c-50)" />
        <StatCard icon={<ShoppingCart className="w-5 h-5 text-blue-600" />} label={t.dashboard.todaySales} value={String(todaySales.length)} bg="#dbeafe" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label={t.dashboard.revenue} value={fmt(totalRevenue)} bg="#f3e8ff" />
        <StatCard icon={<Users className="w-5 h-5 text-amber-600" />} label={t.dashboard.totalClients} value={String(clients.length)} bg="#fef3c7" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.dashboard.recentSales}</h2>
            <button onClick={() => setPage('sales')} className="text-sm font-medium" style={{ color: 'var(--c-600)' }}>
              {t.dashboard.viewAll}
            </button>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>{t.dashboard.noRecentSales}</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2.5 last:border-0" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--c-50)' }}>
                      <Receipt className="w-4 h-4" style={{ color: 'var(--c-600)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {sale.items.length} {sale.items.length > 1 ? t.sales.items : t.sales.item}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.dashboard.lowStockProducts}</h2>
            <button onClick={() => setPage('products')} className="text-sm font-medium" style={{ color: 'var(--c-600)' }}>
              {t.dashboard.viewAll}
            </button>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>{t.dashboard.noLowStock}</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 last:border-0" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.stock === 0 ? '#fee2e2' : '#fef3c7' }}>
                      <AlertTriangle className={`w-4 h-4 ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
