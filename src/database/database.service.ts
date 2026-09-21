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
      -- Clean up non-license tables from Neon PostgreSQL to preserve zero-bandwidth and free tier storage
      DROP TABLE IF EXISTS order_refunds, kitchen_tickets, cash_drawer, stock_movements, expenses, khata_transactions, customer_khatas, orders, categories, products CASCADE;

      -- Pure License & Device Management Schema
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

      -- Cloud Backups per License Key (.zip full backup / .db database)
      CREATE TABLE IF NOT EXISTS license_backups (
        id TEXT PRIMARY KEY,
        license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
        license_key TEXT NOT NULL,
        file_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        mime_type TEXT DEFAULT 'application/zip',
        format TEXT DEFAULT 'zip', -- 'zip' (Full: DB + Images) or 'db' (Database only)
        device_hwid TEXT,
        device_name TEXT DEFAULT 'POS Terminal',
        backup_type TEXT DEFAULT 'auto', -- 'auto', 'manual', 'eod_closing'
        notes TEXT,
        record_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_license_backups_lic_id ON license_backups(license_id);
      CREATE INDEX IF NOT EXISTS idx_license_backups_key ON license_backups(license_key);
      CREATE INDEX IF NOT EXISTS idx_license_backups_created ON license_backups(created_at DESC);
    `);
  }
}
