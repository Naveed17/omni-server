import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LicenseService } from './license.service';
import { OmniposModuleFlags } from '../common/modules';

@Controller('api/admin/licenses')
export class AdminLicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  async getAllLicenses() {
    const licenses = await this.licenseService.getAllLicenses();
    return { success: true, count: licenses.length, data: licenses };
  }

  @Post()
  async createLicense(
    @Body()
    body: {
      userName: string;
      whatsappNumber: string;
      maxDevices?: number;
      licenseType?: string;
      modules?: Partial<OmniposModuleFlags>;
      expiresAt?: string | null;
    },
  ) {
    return await this.licenseService.createLicense(body);
  }

  @Post(':id/toggle')
  async toggleLicense(@Param('id') id: string) {
    return await this.licenseService.toggleLicense(id);
  }

  @Post(':id/modules')
  async updateModules(
    @Param('id') id: string,
    @Body('modules') modules: Partial<OmniposModuleFlags>,
  ) {
    return await this.licenseService.updateModules(id, modules);
  }

  @Delete(':id/devices/:hwid')
  async removeDevice(
    @Param('id') id: string,
    @Param('hwid') hwid: string,
  ) {
    return await this.licenseService.removeDevice(id, hwid);
  }
}
