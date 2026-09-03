import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LicenseService } from './license.service';

@Controller('api/license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'omnipos-license-authority' };
  }

  @Post('activate')
  async activate(
    @Body() body: { key?: string; hwid?: string; deviceName?: string },
    @Res() res: Response,
  ) {
    const result = await this.licenseService.activate(body);
    return res.status(result.status).json(result.body);
  }

  @Post('validate')
  async validate(
    @Body() body: { key?: string; hwid?: string },
    @Res() res: Response,
  ) {
    const result = await this.licenseService.validate(body);
    return res.status(result.status).json(result.body);
  }

  @Post('modules')
  async modules(
    @Body() body: { key?: string },
    @Res() res: Response,
  ) {
    const result = await this.licenseService.getModules(body);
    return res.status(result.status).json(result.body);
  }

  @Get('support')
  async support(@Res() res: Response) {
    const result = await this.licenseService.getSupport();
    return res.status(result.status).json(result.body);
  }

  /** Backward-compatible verify endpoint */
  @Post('verify')
  async verifyLicense(
    @Body() body: { key: string; hwid: string; deviceName?: string },
    @Res() res: Response,
  ) {
    const result = await this.licenseService.activate(body);
    return res.status(result.status).json(result.body);
  }
}
