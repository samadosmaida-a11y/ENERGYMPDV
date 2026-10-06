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
        <h1 className="text-2xl font-bold text-slate-800">{t.products.title}</h1>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t.products.add}</span>
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.products.search}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{t.products.allCategories}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={<Package className="w-12 h-12" />} title={t.products.noProducts} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.products.name}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t.products.category}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.products.price}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.products.stock}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">{t.products.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.barcode || p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color="blue">{p.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      {p.price.toFixed(2)} {settings.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-slate-700">{p.stock} {p.unit}</span>
                        {getStockBadge(p)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm(t.products.confirmDelete)) deleteProduct(p.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
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
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{t.products.category}</label>
            <input
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
