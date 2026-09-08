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
    refundedAmount: r.refunded_amount != null ? parseFloat(r.refunded_amount) : 0,
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

  @Post(':id/refund')
  async refundOrder(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    body: {
      returnedLines: any[];
      refundAmount: number;
      reason?: string;
      paymentMode?: string;
      customerName?: string;
    }
  ) {
    const schemaId = resolveTenantSchemaId(req);
    const orderRes = await this.db.query('SELECT * FROM orders WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    if (orderRes.rows.length === 0) {
      return { ok: false, error: `Order #${id} not found` };
    }
    const order = orderRes.rows[0];

    // 1. Restock products in inventory & create incoming stock_movements
    if (Array.isArray(body.returnedLines) && body.returnedLines.length > 0) {
      for (const line of body.returnedLines) {
        const qty = Number(line.quantity || 1);
        if (qty <= 0) continue;

        if (line.productId) {
          try {
            await this.db.query(
              `UPDATE products SET opening_stock = COALESCE(opening_stock, 0) + $1, updated_at = NOW() WHERE id = $2 AND schema_id = $3`,
              [qty, String(line.productId), schemaId]
            );
          } catch (e) {
            console.warn('[Refund] Product restock error:', e);
          }
        }

        try {
          const movId = `mov_ret_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          await this.db.query(
            `INSERT INTO stock_movements (id, schema_id, module, product_id, product_name, type, quantity, unit_price, reason, note, date)
             VALUES ($1, $2, $3, $4, $5, 'in', $6, $7, $8, $9, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [
              movId,
              schemaId,
              order.module || 'minimart',
              line.productId || 'manual',
              line.name || 'Returned Product',
              qty,
              Number(line.unitPrice || 0),
              'Sales Return / Customer Refund',
              `Return for Order #${order.id}. Reason: ${body.reason || 'Customer Return'}`,
            ]
          );
        } catch (movErr) {
          console.warn('[Refund] Stock movement error:', movErr);
        }
      }
    }

    const totalRefund = Number(body.refundAmount || 0);

    // 2. Adjust Cash Drawer if refunded in Cash
    const pMode = String(body.paymentMode || 'cash').toLowerCase();
    if (pMode === 'cash' && totalRefund > 0) {
      try {
        await this.db.query(
          `UPDATE cash_drawer SET cash_out = COALESCE(cash_out, 0) + $1 WHERE schema_id = $2 AND status = 'open'`,
          [totalRefund, schemaId]
        );
      } catch (drawerErr) {
        console.warn('[Refund] Cash Drawer update error:', drawerErr);
      }
    }

    // 3. Adjust Customer Khata if refunded to Khata account
    const custName = body.customerName || order.customer_name;
    if (pMode === 'khata' && custName && totalRefund > 0) {
      try {
        const khataRes = await this.db.query(
          `SELECT * FROM customer_khatas WHERE name = $1 AND schema_id = $2 LIMIT 1`,
          [custName, schemaId]
        );
        if (khataRes.rows.length > 0) {
          const khata = khataRes.rows[0];
          const newDebt = Math.max(0, (parseFloat(khata.current_debt) || 0) - totalRefund);
          await this.db.query(
            `UPDATE customer_khatas SET current_debt = $1, updated_at = NOW() WHERE id = $2 AND schema_id = $3`,
            [newDebt, khata.id, schemaId]
          );
          await this.db.query(
            `INSERT INTO khata_transactions (id, schema_id, khata_id, type, amount, balance_after, description, payment_method)
             VALUES ($1, $2, $3, 'CREDIT', $4, $5, $6, 'cash')`,
            [`tx_${Date.now()}`, schemaId, khata.id, totalRefund, newDebt, `Refund Reversal - Invoice #${order.id}`]
          );
        }
      } catch (khataErr) {
        console.warn('[Refund] Khata update error:', khataErr);
      }
    }

    // 4. Create OrderRefund record
    const refundId = `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const refundRes = await this.db.query(
      `INSERT INTO order_refunds (id, schema_id, order_id, customer_name, refund_amount, payment_mode, reason, items, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
       RETURNING *`,
      [
        refundId,
        schemaId,
        order.id,
        custName || 'Walk-In Customer',
        totalRefund,
        pMode,
        body.reason || 'Customer Return',
        JSON.stringify(body.returnedLines || []),
      ]
    );

    // 5. Update Order status & refunded_amount
    const prevRefunded = parseFloat(order.refunded_amount || 0);
    const newRefundedTotal = prevRefunded + totalRefund;
    const isFullyRefunded = newRefundedTotal >= parseFloat(order.total_amount || 0);

    const updatedOrderRes = await this.db.query(
      `UPDATE orders
       SET refunded_amount = $1,
           stage = CASE WHEN $2 THEN 'refunded' ELSE stage END,
           updated_at = NOW()
       WHERE id = $3 AND schema_id = $4
       RETURNING *`,
      [newRefundedTotal, isFullyRefunded, order.id, schemaId]
    );

    return {
      ok: true,
      refund: refundRes.rows[0],
      order: mapOrderRow(updatedOrderRes.rows[0]),
    };
  }
}

@Controller('api/refunds')
export class RefundsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getRefunds(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const res = await this.db.query(
        'SELECT * FROM order_refunds WHERE schema_id = $1 ORDER BY created_at DESC',
        [schemaId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        orderId: r.order_id,
        customerName: r.customer_name,
        refundAmount: parseFloat(r.refund_amount || 0),
        paymentMode: r.payment_mode,
        reason: r.reason,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items || [],
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }
}
