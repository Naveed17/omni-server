import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { resolveTenantSchemaId } from '../common/tenant';

@Controller('api/khata')
export class KhataController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getKhatas(@Req() req: Request) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const res = await this.db.query(
        'SELECT * FROM customer_khatas WHERE schema_id = $1 ORDER BY created_at DESC',
        [schemaId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        address: r.address,
        cnic: r.cnic,
        customerType: r.customer_type || 'retail',
        currentDebt: parseFloat(r.current_debt || 0),
        creditLimit: parseFloat(r.credit_limit || 50000),
        dueDays: parseInt(r.due_days || 30, 10),
        note: r.note,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch {
      return [];
    }
  }

  @Get(':id/transactions')
  async getTransactions(@Req() req: Request, @Param('id') khataId: string) {
    const schemaId = resolveTenantSchemaId(req);
    try {
      const res = await this.db.query(
        'SELECT * FROM khata_transactions WHERE schema_id = $1 AND khata_id = $2 ORDER BY created_at DESC',
        [schemaId, khataId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        khataId: r.khata_id,
        type: r.type,
        amount: parseFloat(r.amount),
        balanceAfter: parseFloat(r.balance_after),
        description: r.description,
        paymentMethod: r.payment_method || 'cash',
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }

  @Post()
  async createKhata(
    @Req() req: Request,
    @Body()
    body: {
      id?: string;
      name: string;
      phone?: string;
      address?: string;
      cnic?: string;
      customerType?: string;
      creditLimit?: number;
      dueDays?: number;
      currentDebt?: number;
      note?: string;
    },
  ) {
    const schemaId = resolveTenantSchemaId(req);
    const id = body.id || `khata_${Date.now()}`;
    const debt = Number(body.currentDebt) || 0;
    const creditLimit = Number(body.creditLimit) || 50000;
    const dueDays = Number(body.dueDays) || 30;

    const res = await this.db.query(
      `INSERT INTO customer_khatas (id, schema_id, name, phone, address, cnic, customer_type, credit_limit, due_days, current_debt, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         cnic = EXCLUDED.cnic,
         customer_type = EXCLUDED.customer_type,
         credit_limit = EXCLUDED.credit_limit,
         due_days = EXCLUDED.due_days,
         current_debt = EXCLUDED.current_debt,
         note = EXCLUDED.note,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        schemaId,
        body.name,
        body.phone || null,
        body.address || null,
        body.cnic || null,
        body.customerType || 'retail',
        creditLimit,
        dueDays,
        debt,
        body.note || null,
      ],
    );

    if (debt > 0) {
      try {
        await this.db.query(
          `INSERT INTO khata_transactions (id, schema_id, khata_id, type, amount, balance_after, description, payment_method)
           VALUES ($1, $2, $3, 'DEBIT', $4, $5, 'Opening Balance / Initial Udhaar', 'cash')
           ON CONFLICT (id) DO NOTHING`,
          [`tx_${Date.now()}`, schemaId, id, debt, debt],
        );
      } catch {}
    }

    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      address: r.address,
      cnic: r.cnic,
      customerType: r.customer_type,
      creditLimit: parseFloat(r.credit_limit),
      dueDays: parseInt(r.due_days, 10),
      currentDebt: parseFloat(r.current_debt),
      note: r.note,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  @Put(':id')
  async updateKhata(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      address?: string;
      cnic?: string;
      customerType?: string;
      creditLimit?: number;
      dueDays?: number;
      currentDebt?: number;
      note?: string;
    },
  ) {
    const schemaId = resolveTenantSchemaId(req);
    const res = await this.db.query(
      `UPDATE customer_khatas SET
         name = COALESCE($3, name),
         phone = COALESCE($4, phone),
         address = COALESCE($5, address),
         cnic = COALESCE($6, cnic),
         customer_type = COALESCE($7, customer_type),
         credit_limit = COALESCE($8, credit_limit),
         due_days = COALESCE($9, due_days),
         current_debt = COALESCE($10, current_debt),
         note = COALESCE($11, note),
         updated_at = NOW()
       WHERE id = $1 AND schema_id = $2
       RETURNING *`,
      [
        id,
        schemaId,
        body.name,
        body.phone,
        body.address,
        body.cnic,
        body.customerType,
        body.creditLimit != null ? Number(body.creditLimit) : null,
        body.dueDays != null ? Number(body.dueDays) : null,
        body.currentDebt != null ? Number(body.currentDebt) : null,
        body.note,
      ],
    );
    if (res.rows.length === 0) {
      return { ok: false, error: 'Khata record not found' };
    }
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      address: r.address,
      cnic: r.cnic,
      customerType: r.customer_type,
      creditLimit: parseFloat(r.credit_limit),
      dueDays: parseInt(r.due_days, 10),
      currentDebt: parseFloat(r.current_debt),
      note: r.note,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  @Post(':id/transaction')
  async addTransaction(
    @Req() req: Request,
    @Param('id') khataId: string,
    @Body()
    body: {
      type: 'DEBIT' | 'CREDIT';
      amount: number;
      description?: string;
      paymentMethod?: string;
    },
  ) {
    const schemaId = resolveTenantSchemaId(req);
    const amt = Number(body.amount) || 0;
    const khataRes = await this.db.query(
      'SELECT * FROM customer_khatas WHERE id = $1 AND schema_id = $2',
      [khataId, schemaId]
    );
    if (khataRes.rows.length === 0) {
      return { ok: false, error: 'Khata account not found' };
    }

    const currentDebt = parseFloat(khataRes.rows[0].current_debt || 0);
    const newDebt = body.type === 'DEBIT' ? currentDebt + amt : Math.max(0, currentDebt - amt);

    await this.db.query(
      `UPDATE customer_khatas SET current_debt = $1, updated_at = NOW() WHERE id = $2 AND schema_id = $3`,
      [newDebt, khataId, schemaId],
    );

    const txId = `tx_${Date.now()}`;
    await this.db.query(
      `INSERT INTO khata_transactions (id, schema_id, khata_id, type, amount, balance_after, description, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        txId,
        schemaId,
        khataId,
        body.type,
        amt,
        newDebt,
        body.description || (body.type === 'DEBIT' ? 'Udhaar Added' : 'Payment Received'),
        body.paymentMethod || 'cash',
      ],
    );

    return { ok: true, currentDebt: newDebt, txId };
  }

  @Delete(':id')
  async deleteKhata(@Req() req: Request, @Param('id') id: string) {
    const schemaId = resolveTenantSchemaId(req);
    await this.db.query('DELETE FROM customer_khatas WHERE id = $1 AND schema_id = $2', [id, schemaId]);
    return { ok: true, id };
  }
}
