import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { resolveTenantSchemaId } from '../common/tenant';

function mapProductRow(r: any) {
  return {
    id: r.id,
    module: r.module,
    name: r.name,
    description: r.description,
    costPrice: r.cost_price != null ? parseFloat(r.cost_price) : undefined,
    price: parseFloat(r.price),
    category: r.category,
    skuCode: r.sku_code,
    rackLocation: r.rack_location,
    unit: r.unit,
    minThreshold: r.min_threshold,
    openingStock: r.opening_stock,
    prepTime: r.prep_time,
    displayOrder: r.display_order,
    imageUrl: r.image_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

@Controller('api/products')
export class ProductsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getProducts(@Req() req: Request, @Query('module') module?: string) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      let res;
      if (module) {
        res = await this.db.query(
          'SELECT * FROM products WHERE schema_id = $1 AND module = $2 ORDER BY display_order ASC, name ASC',
          [schemaId, module]
        );
      } else {
        res = await this.db.query(
          'SELECT * FROM products WHERE schema_id = $1 ORDER BY display_order ASC, name ASC',
          [schemaId]
        );
      }
      return res.rows.map(mapProductRow);
    } catch (err: any) {
      return [];
    }
  }

  @Post()
  async createProduct(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `prod_${Date.now()}`;
    const res = await this.db.query(
      `INSERT INTO products (id, schema_id, module, name, category, cost_price, price, sku_code, rack_location, unit, min_threshold, opening_stock, description, image_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         cost_price = EXCLUDED.cost_price,
         price = EXCLUDED.price,
         sku_code = EXCLUDED.sku_code,
         rack_location = EXCLUDED.rack_location,
         opening_stock = EXCLUDED.opening_stock,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         schema_id = EXCLUDED.schema_id,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        schemaId,
        body.module || 'fastfood',
        body.name,
        body.category || 'General',
        body.costPrice != null ? body.costPrice : null,
        body.price || 0,
        body.skuCode || null,
        body.rackLocation || null,
        body.unit || 'PCS',
        body.minThreshold || 10,
        body.openingStock || 0,
        body.description || null,
        body.imageUrl || null,
      ]
    );
    return mapProductRow(res.rows[0]);
  }

  @Put(':id')
  async updateProduct(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE products SET
         name = COALESCE($3, name),
         category = COALESCE($4, category),
         cost_price = COALESCE($5, cost_price),
         price = COALESCE($6, price),
         sku_code = COALESCE($7, sku_code),
         rack_location = COALESCE($8, rack_location),
         opening_stock = COALESCE($9, opening_stock),
         description = COALESCE($10, description),
         image_url = COALESCE($11, image_url),
         updated_at = NOW()
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [
        id,
        schemaId,
        body.name,
        body.category,
        body.costPrice != null ? body.costPrice : null,
        body.price,
        body.skuCode,
        body.rackLocation,
        body.openingStock,
        body.description,
        body.imageUrl,
      ]
    );
    return res.rows[0] ? mapProductRow(res.rows[0]) : body;
  }

  @Delete(':id')
  async deleteProduct(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM products WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true };
  }
}

import { BUSINESS_PROFILES } from '../common/businessProfiles';

@Controller('api/business-profiles')
export class BusinessProfilesController {
  @Get()
  getProfiles() {
    return Object.values(BUSINESS_PROFILES);
  }

  @Get(':id')
  getProfileById(@Param('id') id: string) {
    return BUSINESS_PROFILES[id] || null;
  }
}

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getCategories(@Req() req: Request, @Query('module') module?: string) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      let res;
      if (module) {
        res = await this.db.query(
          'SELECT id, schema_id, module, name, COALESCE(profile, $3) as profile, created_at FROM categories WHERE schema_id = $1 AND module = $2 ORDER BY name ASC',
          [schemaId, module, 'standard']
        );
      } else {
        res = await this.db.query(
          'SELECT id, schema_id, module, name, COALESCE(profile, $2) as profile, created_at FROM categories WHERE schema_id = $1 ORDER BY name ASC',
          [schemaId, 'standard']
        );
      }
      return res.rows;
    } catch {
      return [];
    }
  }

  @Post()
  async createCategory(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `cat_${Date.now()}`;
    const profile = body.profile || 'standard';
    const res = await this.db.query(
      `INSERT INTO categories (id, schema_id, module, name, profile) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name, 
         module = EXCLUDED.module,
         profile = EXCLUDED.profile,
         schema_id = EXCLUDED.schema_id
       RETURNING *`,
      [id, schemaId, body.module || 'fastfood', body.name, profile]
    );
    return res.rows[0];
  }

  @Post('seed-profile')
  async seedProfile(@Req() req: Request, @Body() body: { profileKey: string; module?: string }) {
    const schemaId = resolveTenantSchemaId(req);
    const prof = BUSINESS_PROFILES[body.profileKey];
    if (!prof) {
      return { ok: false, message: `Unknown profile ${body.profileKey}` };
    }
    const targetModule = body.module || prof.module;
    const inserted = [];

    for (const item of prof.defaultCategories) {
      const catId = `cat_${prof.id}_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const res = await this.db.query(
        `INSERT INTO categories (id, schema_id, module, name, profile)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           profile = EXCLUDED.profile,
           schema_id = EXCLUDED.schema_id
         RETURNING *`,
        [catId, schemaId, targetModule, item.name, item.profile || prof.id]
      );
      inserted.push(res.rows[0]);
    }

    return { ok: true, count: inserted.length, categories: inserted };
  }

  @Put(':id')
  async updateCategory(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE categories SET
         name = COALESCE($3, name),
         module = COALESCE($4, module),
         profile = COALESCE($5, profile)
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [id, schemaId, body.name, body.module, body.profile]
    );
    return res.rows[0] || body;
  }

  @Delete(':id')
  async deleteCategory(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM categories WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true };
  }
}
