import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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
  async getOrders(@Query('module') module?: string) {
    try {
      let res;
      if (module) {
        res = await this.db.query('SELECT * FROM orders WHERE module = $1 ORDER BY created_at DESC', [module]);
      } else {
        res = await this.db.query('SELECT * FROM orders ORDER BY created_at DESC');
      }
      return res.rows.map(mapOrderRow);
    } catch {
      return [];
    }
  }

  @Post()
  async createOrder(@Body() body: any) {
    const id = body.id || `ord_${Date.now()}`;
    const linesJson = JSON.stringify(body.lines || []);

    const res = await this.db.query(
      `INSERT INTO orders (id, module, discount_percent, total_amount, customer_name, order_type, stage, lines, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, COALESCE($9::timestamptz, NOW()), NOW())
       ON CONFLICT (id) DO UPDATE SET
         stage = EXCLUDED.stage,
         total_amount = EXCLUDED.total_amount,
         lines = EXCLUDED.lines,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
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

    // Deduct stock for each sold product in PostgreSQL
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
             WHERE id = $2`,
            [qty, String(line.productId)]
          );
        } catch (stockErr) {
          console.error(`[Inventory] Failed to deduct stock for product ${line.productId}:`, stockErr);
        }
      }
    }

    // If Fast Food module, automatically create a KDS Kitchen Ticket
    if (body.module === 'fastfood') {
      try {
        const ticketId = `kds_${Date.now()}`;
        await this.db.query(
          `INSERT INTO kitchen_tickets (id, order_id, status, order_type, notes, created_at, updated_at)
           VALUES ($1, $2, 'pending', $3, $4, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [ticketId, id, body.orderType || 'Dine-In', body.customerName ? `Customer: ${body.customerName}` : null]
        );
      } catch (kdsErr) {
        console.error('[KDS] Failed to auto-create kitchen ticket:', kdsErr);
      }
    }

    return orderRow;
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    const res = await this.db.query(
      `UPDATE orders SET
         stage = COALESCE($2, stage),
         total_amount = COALESCE($3, total_amount),
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, body.stage, body.totalAmount]
    );
    return res.rows[0] ? mapOrderRow(res.rows[0]) : body;
  }
}
