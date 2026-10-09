import { useState } from 'react';
import { useStore } from '../store';
import { Modal, Button, Input, Select, Badge, EmptyState } from './ui';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import type { Product } from '../types';

function genId() {
  return crypto.randomUUID();
}

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct, t, settings } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || '').includes(search);
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  const getStockBadge = (p: Product) => {
    if (p.stock <= 0) return <Badge color="red">{t.products.outOfStock}</Badge>;
    if (p.stock <= (p.min_stock || settings.low_stock_threshold)) return <Badge color="amber">{t.products.lowStock}</Badge>;
    return <Badge color="green">{t.products.inStock}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.products.title}</h1>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t.products.add}</span>
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.products.search}
            className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <option value="">{t.products.allCategories}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <EmptyState icon={<Package className="w-12 h-12" />} title={t.products.noProducts} />
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.products.name}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{t.products.category}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.products.price}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t.products.stock}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{t.products.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--c-50)' }}>
                          <Package className="w-4 h-4" style={{ color: 'var(--c-600)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.barcode || p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color="blue">{p.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {p.price.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.stock} {p.unit}</span>
                        {getStockBadge(p)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm(t.products.confirmDelete)) deleteProduct(p.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
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

      {modalOpen && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={async (p) => {
            if (editing) {
              await updateProduct(p);
            } else {
              await addProduct(p);
            }
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSave }: {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const { t } = useStore();
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'General');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));
  const [unit, setUnit] = useState(product?.unit || 'pcs');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [minStock, setMinStock] = useState(String(product?.min_stock || '5'));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: product?.id || genId(),
      name: name.trim(),
      category: category.trim() || 'General',
      price: parseFloat(price) || 0,
      stock: parseFloat(stock) || 0,
      unit: unit.trim() || 'pcs',
      barcode: barcode.trim(),
      min_stock: parseFloat(minStock) || 5,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <Modal open onClose={onClose} title={product ? t.products.edit : t.products.add}>
      <div className="space-y-4">
        <Input label={t.products.name} value={name} onChange={setName} placeholder="Product name" required />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.products.category}</label>
            <input
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <datalist id="categories-list">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <Input label={t.products.unit} value={unit} onChange={setUnit} placeholder="pcs, kg, L..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label={`${t.products.price} (${t.common.currency})`} value={price} onChange={setPrice} type="number" placeholder="0.00" />
          <Input label={t.products.stock} value={stock} onChange={setStock} type="number" placeholder="0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t.products.barcode} value={barcode} onChange={setBarcode} placeholder="..." />
          <Input label={t.products.minStock} value={minStock} onChange={setMinStock} type="number" placeholder="5" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>{t.products.cancel}</Button>
          <Button onClick={handleSave}>{t.products.save}</Button>
        </div>
      </div>
    </Modal>
  );
}
