import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('api/khata')
export class KhataController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getKhatas() {
    try {
      const res = await this.db.query('SELECT * FROM customer_khatas ORDER BY created_at DESC');
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
  async getTransactions(@Param('id') khataId: string) {
    try {
      const res = await this.db.query(
        'SELECT * FROM khata_transactions WHERE khata_id = $1 ORDER BY created_at DESC',
        [khataId]
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
    @Body()
    body: {
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
    const id = `khata_${Date.now()}`;
    const debt = Number(body.currentDebt) || 0;
    const creditLimit = Number(body.creditLimit) || 50000;
    const dueDays = Number(body.dueDays) || 30;

    const res = await this.db.query(
      `INSERT INTO customer_khatas (id, name, phone, address, cnic, customer_type, credit_limit, due_days, current_debt, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        id,
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
      await this.db.query(
        `INSERT INTO khata_transactions (id, khata_id, type, amount, balance_after, description, payment_method)
         VALUES ($1, $2, 'DEBIT', $3, $4, 'Opening Balance / Initial Udhaar', 'cash')`,
        [`tx_${Date.now()}`, id, debt, debt],
      );
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
    @Param('id') khataId: string,
    @Body()
    body: {
      type: 'DEBIT' | 'CREDIT';
      amount: number;
      description?: string;
      paymentMethod?: string;
    },
  ) {
    const amt = Number(body.amount) || 0;
    const khataRes = await this.db.query('SELECT * FROM customer_khatas WHERE id = $1', [khataId]);
    if (khataRes.rows.length === 0) {
      return { ok: false, error: 'Khata account not found' };
    }

    const currentDebt = parseFloat(khataRes.rows[0].current_debt || 0);
    const newDebt = body.type === 'DEBIT' ? currentDebt + amt : Math.max(0, currentDebt - amt);

    await this.db.query(
      `UPDATE customer_khatas SET current_debt = $1, updated_at = NOW() WHERE id = $2`,
      [newDebt, khataId],
    );

    const txId = `tx_${Date.now()}`;
    await this.db.query(
      `INSERT INTO khata_transactions (id, khata_id, type, amount, balance_after, description, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        txId,
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
  async deleteKhata(@Param('id') id: string) {
    await this.db.query('DELETE FROM customer_khatas WHERE id = $1', [id]);
    return { ok: true, id };
  }
}
