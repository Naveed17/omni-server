import { Controller, Get, Post, Body, Headers } from '@nestjs/common';

@Controller('api/pos')
export class PosController {
  @Get('health')
  health() {
    return { ok: true, service: 'omnipos-cloud-sync' };
  }

  @Post('sync/push')
  syncPush(
    @Headers('x-schema-id') schemaId: string,
    @Body() body: { transactions: any[] },
  ) {
    const synced = (body.transactions || []).map((t) => ({
      id: t.id,
      status: 'synced',
      syncedAt: new Date(),
    }));

    return {
      ok: true,
      schemaId: schemaId || 'default',
      count: synced.length,
      synced,
    };
  }

  @Get('catalog')
  getCatalog(@Headers('x-schema-id') schemaId: string) {
    return {
      ok: true,
      schemaId: schemaId || 'default',
      products: [],
    };
  }
}
