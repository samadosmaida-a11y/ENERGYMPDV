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
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.sales.title}</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.sales.search}
            className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <option value="">{t.sales.allPayments}</option>
          <option value="cash">{t.pos.cash}</option>
          <option value="card">{t.pos.card}</option>
          <option value="transfer">{t.pos.transfer}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <EmptyState icon={<Receipt className="w-12 h-12" />} title={t.sales.noSales} />
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.sales.date}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.sales.items}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{t.sales.client}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{t.sales.payment}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.sales.total}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.products.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{new Date(s.created_at).toLocaleDateString()}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.items.length} {t.sales.item}(s)</p>
                      <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
                        {s.items.map((i) => i.product_name).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.client_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{paymentLabels[s.payment_method] || s.payment_method}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--c-600)' }}>{fmt(s.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setReceiptSale(s)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm(t.sales.confirmDelete)) deleteSale(s.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
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
            <div className="text-center pb-3 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{settings.shop_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(receiptSale.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {receiptSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <span style={{ color: 'var(--text-primary)' }}>{item.product_name}</span>
                    <span className="ml-2" style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{(item.price * item.quantity).toFixed(2)} {settings.currency}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed pt-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{t.sales.subtotal}</span>
                <span style={{ color: 'var(--text-primary)' }}>{receiptSale.total.toFixed(2)} {settings.currency}</span>
              </div>
              {settings.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{t.sales.tax} ({settings.tax_rate}%)</span>
                  <span style={{ color: 'var(--text-primary)' }}>{(receiptSale.total * settings.tax_rate / 100).toFixed(2)} {settings.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1">
                <span style={{ color: 'var(--text-primary)' }}>{t.sales.grandTotal}</span>
                <span style={{ color: 'var(--c-600)' }}>{receiptSale.total.toFixed(2)} {settings.currency}</span>
              </div>
            </div>
            <div className="text-center text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
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
