import { useStore } from '../store';
import { Package, Receipt, Users, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

function StatCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
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
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= (p.min_stock || settings.low_stock_threshold));

  const recentSales = sales.slice(0, 5);
  const fmt = (n: number) => `${n.toFixed(2)} ${settings.currency}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t.dashboard.welcome}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.dashboard.welcomeMsg}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-emerald-600" />}
          label={t.dashboard.totalProducts}
          value={String(products.length)}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          label={t.dashboard.todaySales}
          value={String(todaySales.length)}
          color="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          label={t.dashboard.revenue}
          value={fmt(totalRevenue)}
          color="bg-purple-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-amber-600" />}
          label={t.dashboard.totalClients}
          value={String(clients.length)}
          color="bg-amber-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">{t.dashboard.recentSales}</h2>
            <button onClick={() => setPage('sales')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              {t.dashboard.viewAll}
            </button>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{t.dashboard.noRecentSales}</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {sale.items.length} {sale.items.length > 1 ? t.sales.items : t.sales.item}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-700">{fmt(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">{t.dashboard.lowStockProducts}</h2>
            <button onClick={() => setPage('products')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              {t.dashboard.viewAll}
            </button>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{t.dashboard.noLowStock}</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.stock === 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
                      <AlertTriangle className={`w-4 h-4 ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.category}</p>
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
