import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { resolveTenantSchemaId } from '../common/tenant';

function mapOrderRow(r: any) {
  return {
    id: r.id,
    module: r.module,
    discountPercent: r.discount_percent != null ? parseFloat(r.discount_percent) : 0,
    totalAmount: r.total_amount != null ? parseFloat(r.total_amount) : 0,
    customerName: r.customer_name,
    orderType: r.order_type,
    stage: r.stage,
    lines: typeof r.lines === 'string' ? JSON.parse(r.lines) : r.lines || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getOrders(@Req() req: Request, @Query('module') module?: string) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      let res;
      if (module) {
        res = await this.db.query(
          'SELECT * FROM orders WHERE schema_id = $1 AND module = $2 ORDER BY created_at DESC',
          [schemaId, module]
        );
      } else {
        res = await this.db.query(
          'SELECT * FROM orders WHERE schema_id = $1 ORDER BY created_at DESC',
          [schemaId]
        );
      }
      return res.rows.map(mapOrderRow);
    } catch {
      return [];
    }
  }

  @Post()
  async createOrder(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `ord_${Date.now()}`;
    const linesJson = JSON.stringify(body.lines || []);

    const res = await this.db.query(
      `INSERT INTO orders (id, schema_id, module, discount_percent, total_amount, customer_name, order_type, stage, lines, stock_deducted, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, TRUE, COALESCE($10::timestamptz, NOW()), NOW())
       ON CONFLICT (id) DO UPDATE SET
         stage = EXCLUDED.stage,
         total_amount = EXCLUDED.total_amount,
         lines = EXCLUDED.lines,
         schema_id = EXCLUDED.schema_id,
         updated_at = NOW()
       RETURNING *, (xmax = 0) AS is_new_order`,
      [
        id,
        schemaId,
        body.module || 'fastfood',
        body.discountPercent || 0,
        body.totalAmount || 0,
        body.customerName || null,
        body.orderType || 'dine-in',
        body.stage || 'paid',
        linesJson,
        body.createdAt || null,
      ]
    );

    const orderRow = mapOrderRow(res.rows[0]);
    const isNewOrder = Boolean(res.rows[0]?.is_new_order);

    // Deduct stock for each sold product in PostgreSQL ONLY IF this is a new order
    // Prevents double-deduction when order sync/push is retried or sent concurrently
    if (isNewOrder) {
      const orderLines = Array.isArray(body.lines)
        ? body.lines
        : typeof body.lines === 'string'
        ? JSON.parse(body.lines || '[]')
        : [];

      for (const line of orderLines) {
        if (line.productId) {
          try {
            const qty = Math.max(0.01, Number(line.quantity || 1));
            await this.db.query(
              `UPDATE products
               SET opening_stock = GREATEST(0, COALESCE(opening_stock, 0) - $1),
                   updated_at = NOW()
               WHERE id = $2 AND schema_id = $3`,
              [qty, String(line.productId), schemaId]
            );
          } catch (stockErr) {
            console.error(`[Inventory] Failed to deduct stock for product ${line.productId}:`, stockErr);
          }
        }
      }

      // If Fast Food module, automatically create a KDS Kitchen Ticket for this tenant
      if (body.module === 'fastfood') {
        try {
          const ticketId = `kds_${Date.now()}`;
          await this.db.query(
            `INSERT INTO kitchen_tickets (id, schema_id, order_id, status, order_type, notes, created_at, updated_at)
             VALUES ($1, $2, $3, 'pending', $4, $5, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING`,
            [ticketId, schemaId, id, body.orderType || 'Dine-In', body.customerName ? `Customer: ${body.customerName}` : null]
          );
        } catch (kdsErr) {
          console.error('[KDS] Failed to auto-create kitchen ticket:', kdsErr);
        }
      }
    } else {
      console.log(`[Inventory] Order ${id} already exists in DB. Skipping duplicate stock deduction.`);
    }

    return orderRow;
  }

  @Put(':id')
  async updateOrder(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE orders SET
         stage = COALESCE($3, stage),
         total_amount = COALESCE($4, total_amount),
         updated_at = NOW()
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [id, schemaId, body.stage, body.totalAmount]
    );
    return res.rows[0] ? mapOrderRow(res.rows[0]) : body;
  }
}
