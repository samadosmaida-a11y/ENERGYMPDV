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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--c-100)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--c-600)' }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t.pos.saleSuccess}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.pos.title}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.pos.search}
              className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
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
                    className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${out ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--c-300)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--c-50)' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      {out ? (
                        <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{t.pos.outOfStockProducts}</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.stock} {t.pos.inStock}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--c-600)' }}>{p.price.toFixed(2)} {settings.currency}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <ShoppingCart className="w-5 h-5" style={{ color: 'var(--c-600)' }} />
                {t.pos.cart}
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <X className="w-3.5 h-3.5" /> {t.pos.clear}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t.pos.empty}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.pos.emptyMsg}</p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.price.toFixed(2)} {settings.currency} / {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeQty(item.product_id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-body)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                        <button onClick={() => changeQty(item.product_id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-body)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold w-16 text-right" style={{ color: 'var(--text-primary)' }}>{(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.product_id)} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                  {/* Client selector */}
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
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
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                        style={paymentMethod === m.key
                          ? { backgroundColor: 'var(--c-600)', color: '#fff' }
                          : { backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }
                        }
                        onMouseEnter={(e) => { if (paymentMethod !== m.key) e.currentTarget.style.backgroundColor = 'var(--bg-body)'; }}
                        onMouseLeave={(e) => { if (paymentMethod !== m.key) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t.pos.total}</span>
                    <span className="text-xl font-bold" style={{ color: 'var(--c-600)' }}>{total.toFixed(2)} {settings.currency}</span>
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
