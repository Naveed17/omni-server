import { Controller, Post, Body, Get } from '@nestjs/common';
import { schemaIdForLicenseKey } from '../common/database-mode';

@Controller('api/license')
export class LicenseController {
  @Get('health')
  health() {
    return { ok: true, service: 'omnipos-license-authority' };
  }

  @Post('verify')
  verifyLicense(@Body() body: { key: string; hwid: string }) {
    const { key, hwid } = body;
    if (!key) {
      return { ok: false, error: 'License key is required.' };
    }

    const schemaId = schemaIdForLicenseKey(key);
    return {
      ok: true,
      key,
      hwid,
      schemaId,
      status: 'active',
      databaseMode: 'online',
      expiresAt: null,
    };
  }
}
