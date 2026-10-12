import { createClient } from '@supabase/supabase-js';
import type { Product, Sale, Client, Settings } from './types';
import type { Theme } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function initDB(): Promise<void> {
  // Tables already created via migration; nothing to do here
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) { console.error('getProducts:', error.message); return []; }
  return (data || []) as Product[];
}

export async function addProduct(p: Product): Promise<void> {
  const { error } = await supabase.from('products').insert({
    id: p.id, name: p.name, category: p.category, purchase_price: p.purchase_price,
    price: p.price, stock: p.stock, unit: p.unit, barcode: p.barcode || '',
    min_stock: p.min_stock, expiry_date: p.expiry_date || '',
    created_at: p.created_at, updated_at: p.updated_at,
  });
  if (error) console.error('addProduct:', error.message);
}

export async function updateProduct(p: Product): Promise<void> {
  const { error } = await supabase.from('products').update({
    name: p.name, category: p.category, purchase_price: p.purchase_price,
    price: p.price, stock: p.stock, unit: p.unit, barcode: p.barcode || '',
    min_stock: p.min_stock, expiry_date: p.expiry_date || '',
    updated_at: p.updated_at,
  }).eq('id', p.id);
  if (error) console.error('updateProduct:', error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('deleteProduct:', error.message);
}

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getSales:', error.message); return []; }
  return (data || []).map((s: Record<string, unknown>) => ({
    ...s,
    items: JSON.parse(s.items as string),
  })) as Sale[];
}

export async function addSale(s: Sale): Promise<void> {
  const { error } = await supabase.from('sales').insert({
    id: s.id, items: JSON.stringify(s.items), total: s.total,
    client_id: s.client_id, client_name: s.client_name,
    payment_method: s.payment_method, created_at: s.created_at,
  });
  if (error) console.error('addSale:', error.message);
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) console.error('deleteSale:', error.message);
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('name');
  if (error) { console.error('getClients:', error.message); return []; }
  return (data || []) as Client[];
}

export async function addClient(c: Client): Promise<void> {
  const { error } = await supabase.from('clients').insert({
    id: c.id, name: c.name, phone: c.phone, email: c.email,
    address: c.address, notes: c.notes, created_at: c.created_at,
  });
  if (error) console.error('addClient:', error.message);
}

export async function updateClient(c: Client): Promise<void> {
  const { error } = await supabase.from('clients').update({
    name: c.name, phone: c.phone, email: c.email,
    address: c.address, notes: c.notes,
  }).eq('id', c.id);
  if (error) console.error('updateClient:', error.message);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) console.error('deleteClient:', error.message);
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) { console.error('getSettings:', error.message); }
  const rows = (data || []) as { key: string; value: string }[];
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return {
    shop_name: map.shop_name || 'NutriShop',
    currency: map.currency || '€',
    tax_rate: parseFloat(map.tax_rate || '0'),
    language: (map.language as 'fr' | 'en' | 'ar') || 'fr',
    theme: (map.theme as Theme) || 'emerald',
    low_stock_threshold: parseInt(map.low_stock_threshold || '5', 10),
  };
}

export async function saveSettings(s: Settings): Promise<void> {
  const entries: { key: string; value: string }[] = [
    { key: 'shop_name', value: s.shop_name },
    { key: 'currency', value: s.currency },
    { key: 'tax_rate', value: String(s.tax_rate) },
    { key: 'language', value: s.language },
    { key: 'theme', value: s.theme },
    { key: 'low_stock_threshold', value: String(s.low_stock_threshold) },
  ];
  for (const entry of entries) {
    const { error } = await supabase.from('settings')
      .upsert({ key: entry.key, value: entry.value }, { onConflict: 'key' });
    if (error) console.error('saveSettings:', error.message);
  }
}

export async function getAllData(): Promise<{ products: Product[]; sales: Sale[]; clients: Client[]; settings: Settings }> {
  const [products, sales, clients, settings] = await Promise.all([
    getProducts(),
    getSales(),
    getClients(),
    getSettings(),
  ]);
  return { products, sales, clients, settings };
}

export async function resetAllData(): Promise<void> {
  await supabase.from('products').delete().neq('id', '__impossible__');
  await supabase.from('sales').delete().neq('id', '__impossible__');
  await supabase.from('clients').delete().neq('id', '__impossible__');
}

export async function importData(data: { products: Product[]; sales: Sale[]; clients: Client[]; settings: Settings }): Promise<void> {
  await resetAllData();
  for (const p of data.products) await addProduct(p);
  for (const s of data.sales) await addSale(s);
  for (const c of data.clients) await addClient(c);
  await saveSettings(data.settings);
}
