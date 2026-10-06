import { useState } from 'react';
import { useStore } from '../store';
import { Modal, Button, EmptyState } from './ui';
import { Receipt, Search, Eye, Trash2 } from 'lucide-react';
import type { Sale } from '../types';

export function Sales() {
  const { sales, settings, t, deleteSale } = useStore();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const filtered = sales.filter((s) => {
    const matchSearch =
      s.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()));
    const matchPayment = !paymentFilter || s.payment_method === paymentFilter;
    return matchSearch && matchPayment;
  });

  const fmt = (n: number) => `${n.toFixed(2)} ${settings.currency}`;
  const paymentLabels: Record<string, string> = {
    cash: t.pos.cash, card: t.pos.card, transfer: t.pos.transfer,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t.sales.title}</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.sales.search}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">{t.sales.allPayments}</option>
          <option value="cash">{t.pos.cash}</option>
          <option value="card">{t.pos.card}</option>
          <option value="transfer">{t.pos.transfer}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={<Receipt className="w-12 h-12" />} title={t.sales.noSales} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.sales.date}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.sales.items}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t.sales.client}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">{t.sales.payment}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.sales.total}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.products.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">{new Date(s.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{s.items.length} {t.sales.item}(s)</p>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {s.items.map((i) => i.product_name).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{s.client_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{paymentLabels[s.payment_method] || s.payment_method}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{fmt(s.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setReceiptSale(s)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm(t.sales.confirmDelete)) deleteSale(s.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {receiptSale && (
        <Modal open onClose={() => setReceiptSale(null)} title={t.sales.receipt} maxWidth="max-w-sm">
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-dashed border-slate-200">
              <p className="font-bold text-slate-800">{settings.shop_name}</p>
              <p className="text-xs text-slate-400">{new Date(receiptSale.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {receiptSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <span className="text-slate-700">{item.product_name}</span>
                    <span className="text-slate-400 ml-2">×{item.quantity}</span>
                  </div>
                  <span className="text-slate-700 font-medium">{(item.price * item.quantity).toFixed(2)} {settings.currency}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t.sales.subtotal}</span>
                <span className="text-slate-700">{receiptSale.total.toFixed(2)} {settings.currency}</span>
              </div>
              {settings.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.sales.tax} ({settings.tax_rate}%)</span>
                  <span className="text-slate-700">{(receiptSale.total * settings.tax_rate / 100).toFixed(2)} {settings.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1">
                <span className="text-slate-800">{t.sales.grandTotal}</span>
                <span className="text-emerald-600">{receiptSale.total.toFixed(2)} {settings.currency}</span>
              </div>
            </div>
            <div className="text-center text-xs text-slate-400 pt-2">
              {paymentLabels[receiptSale.payment_method]}
              {receiptSale.client_name && ` • ${receiptSale.client_name}`}
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              {t.sales.print}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
