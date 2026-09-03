import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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
  async getProducts(@Query('module') module?: string) {
    try {
      let res;
      if (module) {
        res = await this.db.query('SELECT * FROM products WHERE module = $1 ORDER BY display_order ASC, name ASC', [module]);
      } else {
        res = await this.db.query('SELECT * FROM products ORDER BY display_order ASC, name ASC');
      }
      return res.rows.map(mapProductRow);
    } catch (err: any) {
      return [];
    }
  }

  @Post()
  async createProduct(@Body() body: any) {
    const id = body.id || `prod_${Date.now()}`;
    const res = await this.db.query(
      `INSERT INTO products (id, module, name, category, cost_price, price, sku_code, rack_location, unit, min_threshold, opening_stock, description, image_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
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
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        body.module || 'fastfood',
        body.name,
        body.category || 'General',
        body.costPrice || null,
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
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const res = await this.db.query(
      `UPDATE products SET
         name = COALESCE($2, name),
         category = COALESCE($3, category),
         cost_price = COALESCE($4, cost_price),
         price = COALESCE($5, price),
         sku_code = COALESCE($6, sku_code),
         rack_location = COALESCE($7, rack_location),
         opening_stock = COALESCE($8, opening_stock),
         description = COALESCE($9, description),
         image_url = COALESCE($10, image_url),
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
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
  async deleteProduct(@Param('id') id: string) {
    await this.db.query('DELETE FROM products WHERE id = $1', [id]);
    return { ok: true };
  }
}

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getCategories(@Query('module') module?: string) {
    try {
      let res;
      if (module) {
        res = await this.db.query('SELECT * FROM categories WHERE module = $1 ORDER BY name ASC', [module]);
      } else {
        res = await this.db.query('SELECT * FROM categories ORDER BY name ASC');
      }
      return res.rows;
    } catch {
      return [];
    }
  }

  @Post()
  async createCategory(@Body() body: any) {
    const id = body.id || `cat_${Date.now()}`;
    const res = await this.db.query(
      `INSERT INTO categories (id, module, name) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [id, body.module || 'fastfood', body.name]
    );
    return res.rows[0];
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.db.query('DELETE FROM categories WHERE id = $1', [id]);
    return { ok: true };
  }
}
