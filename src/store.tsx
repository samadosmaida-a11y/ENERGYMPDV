import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product, Sale, Client, Settings, Page } from './types';
import * as db from './db';
import { translations, type Lang } from './i18n';

interface Store {
  products: Product[];
  sales: Sale[];
  clients: Client[];
  settings: Settings;
  loading: boolean;
  currentPage: Page;
  setPage: (p: Page) => void;
  refresh: () => Promise<void>;
  // Products
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Sales
  addSale: (s: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  // Clients
  addClient: (c: Client) => Promise<void>;
  updateClient: (c: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  // Settings
  saveSettings: (s: Settings) => Promise<void>;
  // Data
  exportData: () => Promise<void>;
  importData: (data: db_params) => Promise<void>;
  resetAllData: () => Promise<void>;
  // i18n
  t: typeof translations.fr;
}

type db_params = Parameters<typeof db.importData>[0];

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>({
    shop_name: 'NutriShop',
    currency: '€',
    tax_rate: 0,
    language: 'fr',
    low_stock_threshold: 5,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const refresh = useCallback(async () => {
    const [p, s, c, st] = await Promise.all([
      db.getProducts(),
      db.getSales(),
      db.getClients(),
      db.getSettings(),
    ]);
    setProducts(p);
    setSales(s);
    setClients(c);
    setSettings(st);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await db.initDB();
        await refresh();
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const addProduct = useCallback(async (p: Product) => {
    await db.addProduct(p);
    await refresh();
  }, [refresh]);

  const updateProduct = useCallback(async (p: Product) => {
    await db.updateProduct(p);
    await refresh();
  }, [refresh]);

  const deleteProduct = useCallback(async (id: string) => {
    await db.deleteProduct(id);
    await refresh();
  }, [refresh]);

  const addSale = useCallback(async (s: Sale) => {
    await db.addSale(s);
    await refresh();
  }, [refresh]);

  const deleteSale = useCallback(async (id: string) => {
    await db.deleteSale(id);
    await refresh();
  }, [refresh]);

  const addClient = useCallback(async (c: Client) => {
    await db.addClient(c);
    await refresh();
  }, [refresh]);

  const updateClient = useCallback(async (c: Client) => {
    await db.updateClient(c);
    await refresh();
  }, [refresh]);

  const deleteClient = useCallback(async (id: string) => {
    await db.deleteClient(id);
    await refresh();
  }, [refresh]);

  const saveSettings = useCallback(async (s: Settings) => {
    await db.saveSettings(s);
    await refresh();
  }, [refresh]);

  const exportData = useCallback(async () => {
    const data = await db.getAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrishop-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importDataWrapper = useCallback(async (data: db_params) => {
    await db.importData(data);
    await refresh();
  }, [refresh]);

  const resetAllData = useCallback(async () => {
    await db.resetAllData();
    await refresh();
  }, [refresh]);

  const t = translations[settings.language] as typeof translations.fr;

  const store: Store = {
    products, sales, clients, settings, loading,
    currentPage, setPage: setCurrentPage,
    refresh,
    addProduct, updateProduct, deleteProduct,
    addSale, deleteSale,
    addClient, updateClient, deleteClient,
    saveSettings,
    exportData,
    importData: importDataWrapper,
    resetAllData,
    t,
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
