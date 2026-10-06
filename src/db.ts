import { PGlite } from '@electric-sql/pglite';
import type { Product, Sale, Client, Settings } from './types';

let db: PGlite | null = null;

export async function initDB(): Promise<void> {
  try {
    db = new PGlite('idb://nutrishop');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General',
        price REAL NOT NULL DEFAULT 0,
        stock REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'pcs',
        barcode TEXT DEFAULT '',
        min_stock REAL NOT NULL DEFAULT 5,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        items TEXT NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        client_id TEXT,
        client_name TEXT,
        payment_method TEXT NOT NULL DEFAULT 'cash',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        address TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  } catch {
    try {
      db = new PGlite();
      await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'General',
          price REAL NOT NULL DEFAULT 0,
          stock REAL NOT NULL DEFAULT 0,
          unit TEXT NOT NULL DEFAULT 'pcs',
          barcode TEXT DEFAULT '',
          min_stock REAL NOT NULL DEFAULT 5,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sales (
          id TEXT PRIMARY KEY,
          items TEXT NOT NULL,
          total REAL NOT NULL DEFAULT 0,
          client_id TEXT,
          client_name TEXT,
          payment_method TEXT NOT NULL DEFAULT 'cash',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT DEFAULT '',
          email TEXT DEFAULT '',
          address TEXT DEFAULT '',
          notes TEXT DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
    } catch {
      db = null;
    }
  }
}

function getDB(): PGlite {
  if (!db) throw new Error('DB not initialized');
  return db;
}

export async function getProducts(): Promise<Product[]> {
  if (!db) return [];
  const result = await getDB().query('SELECT * FROM products ORDER BY name');
  return result.rows as unknown as Product[];
}

export async function addProduct(p: Product): Promise<void> {
  if (!db) return;
  await getDB().query(
    `INSERT INTO products (id, name, category, price, stock, unit, barcode, min_stock, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [p.id, p.name, p.category, p.price, p.stock, p.unit, p.barcode || '', p.min_stock, p.created_at, p.updated_at]
  );
}

export async function updateProduct(p: Product): Promise<void> {
  if (!db) return;
  await getDB().query(
    `UPDATE products SET name=$1, category=$2, price=$3, stock=$4, unit=$5, barcode=$6, min_stock=$7, updated_at=$8
     WHERE id=$9`,
    [p.name, p.category, p.price, p.stock, p.unit, p.barcode || '', p.min_stock, p.updated_at, p.id]
  );
}

export async function deleteProduct(id: string): Promise<void> {
  if (!db) return;
  await getDB().query('DELETE FROM products WHERE id=$1', [id]);
}

export async function getSales(): Promise<Sale[]> {
  if (!db) return [];
  const result = await getDB().query('SELECT * FROM sales ORDER BY created_at DESC');
  return (result.rows as unknown as Sale[]).map((s) => ({
    ...s,
    items: JSON.parse(s.items as unknown as string),
  }));
}

export async function addSale(s: Sale): Promise<void> {
  if (!db) return;
  await getDB().query(
    `INSERT INTO sales (id, items, total, client_id, client_name, payment_method, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [s.id, JSON.stringify(s.items), s.total, s.client_id, s.client_name, s.payment_method, s.created_at]
  );
}

export async function deleteSale(id: string): Promise<void> {
  if (!db) return;
  await getDB().query('DELETE FROM sales WHERE id=$1', [id]);
}

export async function getClients(): Promise<Client[]> {
  if (!db) return [];
  const result = await getDB().query('SELECT * FROM clients ORDER BY name');
  return result.rows as unknown as Client[];
}

export async function addClient(c: Client): Promise<void> {
  if (!db) return;
  await getDB().query(
    `INSERT INTO clients (id, name, phone, email, address, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [c.id, c.name, c.phone, c.email, c.address, c.notes, c.created_at]
  );
}

export async function updateClient(c: Client): Promise<void> {
  if (!db) return;
  await getDB().query(
    `UPDATE clients SET name=$1, phone=$2, email=$3, address=$4, notes=$5 WHERE id=$6`,
    [c.name, c.phone, c.email, c.address, c.notes, c.id]
  );
}

export async function deleteClient(id: string): Promise<void> {
  if (!db) return;
  await getDB().query('DELETE FROM clients WHERE id=$1', [id]);
}

export async function getSettings(): Promise<Settings> {
  if (!db) {
    return {
      shop_name: 'NutriShop',
      currency: '€',
      tax_rate: 0,
      language: 'fr',
      low_stock_threshold: 5,
    };
  }
  const result = await getDB().query('SELECT * FROM settings');
  const rows = result.rows as unknown as { key: string; value: string }[];
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return {
    shop_name: map.shop_name || 'NutriShop',
    currency: map.currency || '€',
    tax_rate: parseFloat(map.tax_rate || '0'),
    language: (map.language as 'fr' | 'en') || 'fr',
    low_stock_threshold: parseInt(map.low_stock_threshold || '5', 10),
  };
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!db) return;
  const entries: [string, string][] = [
    ['shop_name', s.shop_name],
    ['currency', s.currency],
    ['tax_rate', String(s.tax_rate)],
    ['language', s.language],
    ['low_stock_threshold', String(s.low_stock_threshold)],
  ];
  for (const [key, value] of entries) {
    await getDB().query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT(key) DO UPDATE SET value=$2`,
      [key, value]
    );
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
  if (!db) return;
  await getDB().exec('DELETE FROM products; DELETE FROM sales; DELETE FROM clients;');
}

export async function importData(data: { products: Product[]; sales: Sale[]; clients: Client[]; settings: Settings }): Promise<void> {
  if (!db) return;
  await getDB().exec('DELETE FROM products; DELETE FROM sales; DELETE FROM clients;');
  for (const p of data.products) {
    await addProduct(p);
  }
  for (const s of data.sales) {
    await addSale(s);
  }
  for (const c of data.clients) {
    await addClient(c);
  }
  await saveSettings(data.settings);
}
