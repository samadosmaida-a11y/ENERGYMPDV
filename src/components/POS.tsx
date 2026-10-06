import { useState } from 'react';
import { useStore } from '../store';
import { Button, EmptyState } from './ui';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, X } from 'lucide-react';
import type { SaleItem, Sale } from '../types';

function genId() {
  return crypto.randomUUID();
}

export function POS() {
  const { products, clients, settings, t, addSale } = useStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [clientId, setClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [success, setSuccess] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search)
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
      }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.product_id !== productId) return i;
        const product = products.find((p) => p.id === productId);
        const newQty = i.quantity + delta;
        if (newQty <= 0) return i;
        if (product && newQty > product.stock) return i;
        return { ...i, quantity: newQty };
      }).filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm(t.pos.confirmClear)) setCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    const client = clients.find((c) => c.id === clientId);
    const sale: Sale = {
      id: genId(),
      items: cart,
      total,
      client_id: clientId || null,
      client_name: client?.name || null,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
    };
    await addSale(sale);
    setCart([]);
    setClientId('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">{t.pos.saleSuccess}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">{t.pos.title}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.pos.search}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200">
              <EmptyState icon={<ShoppingCart className="w-12 h-12" />} title={t.products.noProducts} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const out = p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p.id)}
                    disabled={out}
                    className={`bg-white rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-emerald-300 hover:shadow-md ${out ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-lg">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      {out ? (
                        <span className="text-xs text-red-500 font-medium">{t.pos.outOfStockProducts}</span>
                      ) : (
                        <span className="text-xs text-slate-400">{p.stock} {t.pos.inStock}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">{p.price.toFixed(2)} {settings.currency}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                {t.pos.cart}
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> {t.pos.clear}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">{t.pos.empty}</p>
                <p className="text-xs text-slate-400 mt-1">{t.pos.emptyMsg}</p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-2 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                        <p className="text-xs text-slate-400">{item.price.toFixed(2)} {settings.currency} / {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeQty(item.product_id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold text-slate-700 w-8 text-center">{item.quantity}</span>
                        <button onClick={() => changeQty(item.product_id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.product_id)} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-4 space-y-3">
                  {/* Client selector */}
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">{t.pos.noClient}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  {/* Payment method */}
                  <div className="flex gap-2">
                    {[
                      { key: 'cash', label: t.pos.cash },
                      { key: 'card', label: t.pos.card },
                      { key: 'transfer', label: t.pos.transfer },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          paymentMethod === m.key
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-base font-bold text-slate-800">{t.pos.total}</span>
                    <span className="text-xl font-bold text-emerald-600">{total.toFixed(2)} {settings.currency}</span>
                  </div>

                  <Button onClick={checkout} size="lg" className="w-full">
                    {t.pos.checkout} — {total.toFixed(2)} {settings.currency}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
