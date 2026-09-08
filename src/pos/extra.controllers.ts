import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { resolveTenantSchemaId } from '../common/tenant';

// ── Stock Movements ──
@Controller('api/stock-movements')
export class StockController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getMovements(@Req() req: Request, @Query('module') module?: string) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      let res;
      if (module) {
        res = await this.db.query(
          'SELECT * FROM stock_movements WHERE schema_id = $1 AND module = $2 ORDER BY date DESC',
          [schemaId, module]
        );
      } else {
        res = await this.db.query(
          'SELECT * FROM stock_movements WHERE schema_id = $1 ORDER BY date DESC',
          [schemaId]
        );
      }
      return res.rows.map((r) => ({
        id: r.id,
        module: r.module,
        productId: r.product_id,
        productName: r.product_name,
        type: r.type,
        quantity: r.quantity,
        unitCost: r.unit_cost != null ? parseFloat(r.unit_cost) : null,
        unitPrice: r.unit_price != null ? parseFloat(r.unit_price) : null,
        reason: r.reason,
        note: r.note,
        date: r.date,
      }));
    } catch {
      return [];
    }
  }

  @Post()
  async createMovement(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `mov_${Date.now()}`;
    const res = await this.db.query(
      `INSERT INTO stock_movements (id, schema_id, module, product_id, product_name, type, quantity, unit_cost, unit_price, reason, note, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12::timestamptz, NOW()))
       ON CONFLICT (id) DO UPDATE SET
         type = EXCLUDED.type,
         quantity = EXCLUDED.quantity,
         unit_cost = EXCLUDED.unit_cost,
         unit_price = EXCLUDED.unit_price,
         reason = EXCLUDED.reason,
         note = EXCLUDED.note,
         date = EXCLUDED.date
       RETURNING *`,
      [
        id,
        schemaId,
        body.module || 'fastfood',
        body.productId || 'prod_gen',
        body.productName || 'Item',
        body.type || 'in',
        Number(body.quantity) || 1,
        body.unitCost ? Number(body.unitCost) : null,
        body.unitPrice ? Number(body.unitPrice) : null,
        body.reason || 'General',
        body.note || body.referenceInvoice || null,
        body.date || null,
      ]
    );

    // Also update product stock count for this tenant if valid productId
    if (body.productId && body.productId !== 'prod_gen' && body.productId !== 'manual') {
      try {
        const qtyDelta = body.type === 'in' ? Number(body.quantity) : -Number(body.quantity);
        await this.db.query(
          `UPDATE products SET opening_stock = COALESCE(opening_stock, 0) + $1 WHERE id = $2 AND schema_id = $3`,
          [qtyDelta, body.productId, schemaId]
        );
      } catch (err) {
        console.warn('[Stock] Product stock update warning:', err);
      }
    }

    return res.rows[0];
  }

  @Put(':id')
  async updateMovement(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE stock_movements SET
         type = COALESCE($3, type),
         quantity = COALESCE($4, quantity),
         unit_cost = COALESCE($5, unit_cost),
         unit_price = COALESCE($6, unit_price),
         reason = COALESCE($7, reason),
         note = COALESCE($8, note)
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [
        id,
        schemaId,
        body.type,
        body.quantity != null ? Number(body.quantity) : null,
        body.unitCost != null ? Number(body.unitCost) : null,
        body.unitPrice != null ? Number(body.unitPrice) : null,
        body.reason,
        body.note,
      ]
    );
    return res.rows[0] || body;
  }

  @Delete(':id')
  async deleteMovement(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM stock_movements WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true, id };
  }
}

// ── Expenses & Cash Drawer ──
@Controller('api')
export class ExpensesController {
  constructor(private readonly db: DatabaseService) {}

  @Get('expenses')
  async getExpenses(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const res = await this.db.query(
        'SELECT * FROM expenses WHERE schema_id = $1 ORDER BY date DESC',
        [schemaId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        category: r.category,
        amount: parseFloat(r.amount),
        paymentMode: r.payment_mode,
        vendorName: r.vendor_name,
        description: r.description,
        date: r.date,
      }));
    } catch {
      return [];
    }
  }

  @Post('expenses')
  async createExpense(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `exp_${Date.now()}`;
    const res = await this.db.query(
      `INSERT INTO expenses (id, schema_id, category, amount, payment_mode, vendor_name, description, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()))
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category,
         amount = EXCLUDED.amount,
         payment_mode = EXCLUDED.payment_mode,
         vendor_name = EXCLUDED.vendor_name,
         description = EXCLUDED.description,
         date = EXCLUDED.date
       RETURNING *`,
      [
        id,
        schemaId,
        body.category || 'Other',
        Number(body.amount) || 0,
        body.paymentMode || 'cash',
        body.vendorName || null,
        body.description || null,
        body.date || null,
      ]
    );

    // If paid via cash, also increment cash drawer cashOut
    if (body.paymentMode === 'cash') {
      try {
        await this.db.query(
          `UPDATE cash_drawer SET cash_out = cash_out + $1 WHERE schema_id = $2 AND status = 'open'`,
          [Number(body.amount) || 0, schemaId]
        );
      } catch {}
    }

    return res.rows[0];
  }

  @Put('expenses/:id')
  async updateExpense(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE expenses SET
         category = COALESCE($3, category),
         amount = COALESCE($4, amount),
         payment_mode = COALESCE($5, payment_mode),
         vendor_name = COALESCE($6, vendor_name),
         description = COALESCE($7, description)
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [
        id,
        schemaId,
        body.category,
        body.amount != null ? Number(body.amount) : null,
        body.paymentMode,
        body.vendorName,
        body.description,
      ]
    );
    return res.rows[0] || body;
  }

  @Delete('expenses/:id')
  async deleteExpense(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM expenses WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true, id };
  }

  @Get('cash-drawer')
  async getCashDrawer(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      let res = await this.db.query(
        "SELECT * FROM cash_drawer WHERE schema_id = $1 AND status = 'open' ORDER BY date DESC LIMIT 1",
        [schemaId]
      );
      if (res.rows.length === 0) {
        res = await this.db.query(
          `INSERT INTO cash_drawer (id, schema_id, opening_float, cash_sales, cash_in, cash_out, status)
           VALUES ($1, $2, 5000, 0, 0, 0, 'open')
           RETURNING *`,
          [`drawer_${Date.now()}`, schemaId]
        );
      }
      const r = res.rows[0];
      return {
        id: r.id,
        date: r.date,
        openingFloat: parseFloat(r.opening_float || 0),
        cashSales: parseFloat(r.cash_sales || 0),
        cashIn: parseFloat(r.cash_in || 0),
        cashOut: parseFloat(r.cash_out || 0),
        closingCash: r.closing_cash != null ? parseFloat(r.closing_cash) : null,
        status: r.status,
      };
    } catch {
      return { openingFloat: 5000, cashSales: 0, cashIn: 0, cashOut: 0, status: 'open' };
    }
  }

  @Post('cash-drawer/action')
  async handleCashDrawerAction(
    @Req() req: Request,
    @Body() body: { type: string; amount: number; notes?: string }
  ) {
    const schemaId = resolveTenantSchemaId(req);
    const amt = Number(body.amount) || 0;
    if (body.type === 'CASH_IN') {
      await this.db.query(
        `UPDATE cash_drawer SET cash_in = cash_in + $1 WHERE schema_id = $2 AND status = 'open'`,
        [amt, schemaId]
      );
    } else if (body.type === 'CASH_OUT') {
      await this.db.query(
        `UPDATE cash_drawer SET cash_out = cash_out + $1 WHERE schema_id = $2 AND status = 'open'`,
        [amt, schemaId]
      );
    } else if (body.type === 'CLOSE') {
      await this.db.query(
        `UPDATE cash_drawer SET status = 'closed', closing_cash = $1 WHERE schema_id = $2 AND status = 'open'`,
        [amt, schemaId]
      );
    }
    return this.getCashDrawer(req);
  }
}

// ── Kitchen KDS Tickets ──
@Controller('api/kitchen/tickets')
export class KitchenController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getTickets(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const res = await this.db.query(
        `SELECT k.*, o.lines, o.customer_name, o.order_type as ot
         FROM kitchen_tickets k
         LEFT JOIN orders o ON k.order_id = o.id
         WHERE k.schema_id = $1 AND k.status != 'served'
         ORDER BY k.created_at ASC`,
        [schemaId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        orderId: r.order_id,
        status: r.status,
        orderType: r.order_type || r.ot,
        createdAt: r.created_at,
        order: {
          lines: typeof r.lines === 'string' ? JSON.parse(r.lines) : r.lines || [],
        },
      }));
    } catch {
      return [];
    }
  }

  @Post()
  async createManualTicket(@Req() req: Request, @Body() body: any) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `kds_${Date.now()}`;
    const orderId = body.orderId || `ord_manual_${Date.now()}`;
    const lines = body.lines || [
      {
        id: `line_${Date.now()}`,
        name: body.itemName || 'Custom Item',
        quantity: Number(body.quantity) || 1,
        variantLabel: body.variantLabel || '',
        notes: body.notes || '',
      },
    ];

    // Ensure order exists so relation resolves properly
    await this.db.query(
      `INSERT INTO orders (id, schema_id, module, discount_percent, total_amount, customer_name, order_type, stage, lines, created_at, updated_at)
       VALUES ($1, $2, 'fastfood', 0, 0, $3, $4, 'paid', $5::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [orderId, schemaId, body.customerName || 'Walk-in / Phone', body.orderType || 'Rush Order', JSON.stringify(lines)]
    );

    const res = await this.db.query(
      `INSERT INTO kitchen_tickets (id, schema_id, order_id, status, order_type, notes, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, schemaId, orderId, body.orderType || 'Rush Order', body.notes || null]
    );

    return {
      id: res.rows[0].id,
      orderId: res.rows[0].order_id,
      status: res.rows[0].status,
      orderType: res.rows[0].order_type,
      createdAt: res.rows[0].created_at,
      order: { lines },
    };
  }

  @Put(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query(
      `UPDATE kitchen_tickets SET status = $1, updated_at = NOW() WHERE id = $2 AND schema_id = $3`,
      [body.status, id, schemaId]
    );
    return { ok: true, id, status: body.status };
  }

  @Delete(':id')
  async deleteTicket(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM kitchen_tickets WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true, id };
  }
}

// ── Reports Analytics (Tenant-isolated Live Aggregation) ──
@Controller('api/reports/analytics')
export class ReportsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getAnalytics(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const salesRes = await this.db.query(
        `SELECT COALESCE(SUM(total_amount), 0) as gross, COUNT(*) as count FROM orders WHERE schema_id = $1`,
        [schemaId]
      );
      const grossSales = parseFloat(salesRes.rows[0].gross || 0);
      const totalOrders = parseInt(salesRes.rows[0].count || 0, 10);

      const expRes = await this.db.query(
        `SELECT COALESCE(SUM(amount), 0) as exp FROM expenses WHERE schema_id = $1`,
        [schemaId]
      );
      const totalExpenses = parseFloat(expRes.rows[0].exp || 0);

      const refRes = await this.db.query(
        `SELECT COALESCE(SUM(refund_amount), 0) as refunds FROM order_refunds WHERE schema_id = $1`,
        [schemaId]
      );
      const totalRefunds = parseFloat(refRes.rows[0]?.refunds || 0);
      const netSales = Math.max(0, grossSales - totalRefunds);

      const cogs = Math.round(netSales * 0.35);
      const netProfit = netSales - cogs - totalExpenses;

      return {
        totalGrossSales: grossSales,
        totalRefunds,
        netSales,
        estimatedCOGS: cogs,
        totalExpenses,
        netProfit,
        totalOrdersCount: totalOrders,
        topSellingItems: [],
      };
    } catch {
      return { totalGrossSales: 0, totalRefunds: 0, netSales: 0, estimatedCOGS: 0, totalExpenses: 0, netProfit: 0, totalOrdersCount: 0, topSellingItems: [] };
    }
  }
}

// ── Database Wipe (Tenant-isolated clear) ──
@Controller('api/database')
export class DatabaseWipeController {
  constructor(private readonly db: DatabaseService) {}

  @Post('wipe')
  async wipeTenantData(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      await this.db.query('DELETE FROM kitchen_tickets WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM order_refunds WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM orders WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM khata_transactions WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM customer_khatas WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM stock_movements WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM expenses WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM products WHERE schema_id = $1', [schemaId]);
      await this.db.query('DELETE FROM categories WHERE schema_id = $1', [schemaId]);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
