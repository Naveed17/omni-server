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
      console.log('[DatabaseService] Schema verified successfully.');
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
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS profile TEXT DEFAULT 'standard';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS schema_id TEXT DEFAULT 'lic_demo';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN DEFAULT FALSE;
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
        admin_username TEXT DEFAULT 'admin',
        admin_password TEXT DEFAULT '1234',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE licenses ADD COLUMN IF NOT EXISTS admin_username TEXT DEFAULT 'admin';
      ALTER TABLE licenses ADD COLUMN IF NOT EXISTS admin_password TEXT DEFAULT '1234';
      ALTER TABLE licenses ADD COLUMN IF NOT EXISTS business_profiles JSONB DEFAULT '["standard"]'::jsonb;

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
}
