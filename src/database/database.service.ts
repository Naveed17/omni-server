import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connString =
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_b9mhJvZp7sYR@ep-restless-math-ayb184fz-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

    this.pool = new Pool({
      connectionString: connString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  async onModuleInit() {
    console.log('[DatabaseService] Initializing Neon PostgreSQL connection and schema...');
    try {
      const res = await this.pool.query('SELECT NOW()');
      console.log(`[DatabaseService] Connected to Neon PostgreSQL at ${res.rows[0].now}`);

      await this.initSchema();
      await this.seedInitialData();
      console.log('[DatabaseService] Schema and initial seed verified successfully.');
    } catch (err: any) {
      console.error('[DatabaseService] Failed to connect to Neon PostgreSQL:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  public async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    return await this.pool.query(text, params);
  }

  private async initSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        cost_price NUMERIC,
        price NUMERIC NOT NULL,
        category TEXT NOT NULL,
        sku_code TEXT,
        rack_location TEXT,
        unit TEXT,
        min_threshold INT DEFAULT 10,
        opening_stock INT DEFAULT 50,
        prep_time INT,
        display_order INT DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        discount_percent NUMERIC DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        customer_name TEXT,
        order_type TEXT,
        stage TEXT DEFAULT 'paid',
        lines JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customer_khatas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        current_debt NUMERIC DEFAULT 0,
        credit_limit NUMERIC DEFAULT 50000,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS khata_transactions (
        id TEXT PRIMARY KEY,
        khata_id TEXT REFERENCES customer_khatas(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        balance_after NUMERIC NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        payment_mode TEXT DEFAULT 'cash',
        vendor_name TEXT,
        description TEXT,
        date TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INT NOT NULL,
        unit_cost NUMERIC,
        unit_price NUMERIC,
        reason TEXT,
        note TEXT,
        date TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS kitchen_tickets (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        order_type TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cash_drawer (
        id TEXT PRIMARY KEY,
        date TIMESTAMPTZ DEFAULT NOW(),
        opening_float NUMERIC DEFAULT 0,
        cash_sales NUMERIC DEFAULT 0,
        cash_in NUMERIC DEFAULT 0,
        cash_out NUMERIC DEFAULT 0,
        closing_cash NUMERIC,
        status TEXT DEFAULT 'open',
        notes TEXT
      );

      ALTER TABLE customer_khatas ADD COLUMN IF NOT EXISTS cnic TEXT;
      ALTER TABLE customer_khatas ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'retail';
      ALTER TABLE customer_khatas ADD COLUMN IF NOT EXISTS due_days INT DEFAULT 30;
      ALTER TABLE khata_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

      -- Multi-tenant schema separation columns
      ALTER TABLE products ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE customer_khatas ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE khata_transactions ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE kitchen_tickets ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE cash_drawer ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';

      CREATE INDEX IF NOT EXISTS idx_products_schema ON products (schema_id);
      CREATE INDEX IF NOT EXISTS idx_categories_schema ON categories (schema_id);
      CREATE INDEX IF NOT EXISTS idx_orders_schema ON orders (schema_id);
      CREATE INDEX IF NOT EXISTS idx_khatas_schema ON customer_khatas (schema_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_schema ON expenses (schema_id);
      CREATE INDEX IF NOT EXISTS idx_stock_schema ON stock_movements (schema_id);
      CREATE INDEX IF NOT EXISTS idx_kitchen_schema ON kitchen_tickets (schema_id);

      CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        user_name TEXT NOT NULL,
        whatsapp_number TEXT NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        max_devices INT NOT NULL DEFAULT 4,
        license_type TEXT NOT NULL DEFAULT 'annual',
        expires_at TIMESTAMPTZ,
        modules JSONB NOT NULL DEFAULT '{}'::jsonb,
        schema_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS license_devices (
        id TEXT PRIMARY KEY,
        license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
        hwid TEXT NOT NULL,
        device_name TEXT NOT NULL DEFAULT 'Unknown PC',
        activated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (license_id, hwid)
      );

      CREATE TABLE IF NOT EXISTS license_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        support_phone TEXT DEFAULT '+92 300 0000000',
        support_email TEXT DEFAULT 'support@omnipos.pk',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      INSERT INTO license_settings (id, support_phone, support_email)
      VALUES ('default', '+92 300 0000000', 'support@omnipos.pk')
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  private async seedInitialData() {
    const prodCountRes = await this.pool.query('SELECT COUNT(*) FROM products');
    const prodCount = parseInt(prodCountRes.rows[0].count, 10);

    if (prodCount === 0) {
      const initialProducts = [
        {
          id: "prod_ff_1",
          module: "fastfood",
          name: "Crispy Zinger Burger",
          category: "Burger",
          cost_price: 320,
          price: 550,
          sku_code: "SKU-89915275",
          rack_location: "Kitchen A-01",
          unit: "PCS",
          min_threshold: 10,
          opening_stock: 50,
          description: "Crispy chicken fillet with Mayo & Lettuce",
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        },
        {
          id: "prod_ff_2",
          module: "fastfood",
          name: "Double Cheese Burger",
          category: "Burger",
          cost_price: 450,
          price: 720,
          sku_code: "SKU-61339903",
          rack_location: "Kitchen A-02",
          unit: "PCS",
          min_threshold: 10,
          opening_stock: 40,
          description: "Two beef patties with double cheddar cheese",
          image_url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
        },
        {
          id: "prod_mm_1",
          module: "minimart",
          name: "seal 80*10",
          category: "General",
          cost_price: 18,
          price: 25,
          sku_code: "SKU-89915275",
          rack_location: "Rack A-01",
          unit: "PCS",
          min_threshold: 10,
          opening_stock: 50,
          description: "Industrial Seal 80x10",
          image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        },
        {
          id: "prod_mm_2",
          module: "minimart",
          name: "Oil Filter Premium",
          category: "Automotive",
          cost_price: 850,
          price: 1200,
          sku_code: "SKU-61339903",
          rack_location: "Rack B-03",
          unit: "PCS",
          min_threshold: 5,
          opening_stock: 25,
          description: "Universal High Flow Oil Filter",
          image_url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
        }
      ];

      for (const p of initialProducts) {
        await this.pool.query(
          `INSERT INTO products (id, module, name, category, cost_price, price, sku_code, rack_location, unit, min_threshold, opening_stock, description, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.module, p.name, p.category, p.cost_price, p.price, p.sku_code, p.rack_location, p.unit, p.min_threshold, p.opening_stock, p.description, p.image_url]
        );
      }
    }

    const catCountRes = await this.pool.query('SELECT COUNT(*) FROM categories');
    const catCount = parseInt(catCountRes.rows[0].count, 10);

    if (catCount === 0) {
      const initialCategories = [
        { id: "cat_1", module: "fastfood", name: "Burger" },
        { id: "cat_2", module: "fastfood", name: "Pizza" },
        { id: "cat_3", module: "fastfood", name: "Beverages" },
        { id: "cat_4", module: "minimart", name: "General" },
        { id: "cat_5", module: "minimart", name: "Automotive" },
      ];

      for (const c of initialCategories) {
        await this.pool.query(
          `INSERT INTO categories (id, module, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.module, c.name]
        );
      }
    }

    const licCountRes = await this.pool.query('SELECT COUNT(*) FROM licenses');
    const licCount = parseInt(licCountRes.rows[0].count, 10);

    if (licCount === 0) {
      console.log('[DatabaseService] Seeding default Omnipos licenses...');
      const defaultModules = {
        fastfood: true,
        omnimart: true,
        kitchen: true,
        catalog: true,
        inventory: true,
        khata: true,
        expenses: true,
        reports: true,
        webStore: false,
        admin: true,
      };

      await this.pool.query(
        `INSERT INTO licenses (id, key, user_name, whatsapp_number, is_enabled, max_devices, license_type, expires_at, modules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (key) DO NOTHING`,
        [
          'lic_demo_01',
          'OMNI-DEMO-2026-LIVE',
          'Omnipos Live Demo',
          '+923001234567',
          true,
          10,
          'annual',
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          JSON.stringify(defaultModules),
        ]
      );

      // A test license with fastfood & kitchen only (no omnimart, no khata) to verify module gating
      const fastFoodOnlyModules = {
        fastfood: true,
        omnimart: false,
        kitchen: true,
        catalog: true,
        inventory: true,
        khata: false,
        expenses: true,
        reports: true,
        webStore: false,
        admin: true,
      };

      await this.pool.query(
        `INSERT INTO licenses (id, key, user_name, whatsapp_number, is_enabled, max_devices, license_type, expires_at, modules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (key) DO NOTHING`,
        [
          'lic_ff_02',
          'OMNI-FAST-FOOD-ONLY',
          'Fast Food Express',
          '+923009876543',
          true,
          5,
          'annual',
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          JSON.stringify(fastFoodOnlyModules),
        ]
      );
    }
  }
}
