export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  barcode?: string;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  client_id: string | null;
  client_name: string | null;
  payment_method: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
}

export type Theme = 'emerald' | 'blue' | 'orange' | 'rose' | 'dark';

export interface Settings {
  shop_name: string;
  currency: string;
  tax_rate: number;
  language: 'fr' | 'en' | 'ar';
  theme: Theme;
  low_stock_threshold: number;
}

export type Page = 'dashboard' | 'products' | 'pos' | 'sales' | 'clients' | 'settings';
